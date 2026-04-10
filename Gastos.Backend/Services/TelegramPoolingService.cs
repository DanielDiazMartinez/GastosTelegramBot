using Gastos.Backend.Models;
using Microsoft.Extensions.Caching.Memory;
using Telegram.Bot;
using Telegram.Bot.Polling;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups;

namespace Gastos.Backend.Services
{

    public class TelegramPoolingService : BackgroundService
    {
        private readonly ITelegramBotClient _botClient;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IMemoryCache _cache;

        public TelegramPoolingService(ITelegramBotClient botClient, IServiceScopeFactory scopeFactory, IMemoryCache cache)
        {
            _botClient = botClient;
            _scopeFactory = scopeFactory;
            _cache = cache;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var receiverOptions = new ReceiverOptions
            {
                // Permitimos mensajes y clics en botones (CallbackQuery)
                AllowedUpdates = new[] { UpdateType.Message, UpdateType.CallbackQuery }
            };

            _botClient.StartReceiving(
                updateHandler: HandleUpdateAsync,
                pollingErrorHandler: HandlePollingErrorAsync,
                receiverOptions: receiverOptions,
                cancellationToken: stoppingToken
            );

            Console.WriteLine("Bot de Gastos iniciado...");
            await Task.Delay(Timeout.Infinite, stoppingToken);
        }

        private async Task HandleUpdateAsync(ITelegramBotClient botClient, Update update, CancellationToken ct)
        {
            if (update.Type == UpdateType.CallbackQuery && update.CallbackQuery != null)
            {
                await HandleCallbackAsync(botClient, update.CallbackQuery, ct);
                return;
            }

            if (update.Message is not { Text: { } messageText } message) return;
            var chatId = message.Chat.Id;

            var mainKeyboard = new ReplyKeyboardMarkup(new[]
            {
                new KeyboardButton[] { "🔴 Gasto", "🟢 Ingreso" }
            })
            { ResizeKeyboard = true };

            if (!_cache.TryGetValue(chatId, out UserState state)) state = new UserState();

            switch (messageText)
            {
                case "/start":
                    _cache.Remove(chatId);
                    await botClient.SendTextMessageAsync(chatId,
                        "Bienvenido al Bot de Gastos. Selecciona una opción para empezar:",
                        replyMarkup: mainKeyboard,
                        cancellationToken: ct);
                    break;
                case "🔴 Gasto":
                    state.Action = messageText.Contains("Gasto") ? "gasto" : "ingreso";
                    state.CategoryId = null;
                    _cache.Set(chatId, state);
                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var repo = scope.ServiceProvider.GetRequiredService<TransactionRepository>();
                        var cats = await repo.GetCategoriesByTypeAsync(TransactionType.Expense, ct);

                        await SendCategoryButtons(botClient, chatId, cats, ct);
                    }
                    break;
                case "🟢 Ingreso":
                    state.Action = messageText.Contains("Gasto") ? "gasto" : "ingreso";
                    state.CategoryId = null;
                    _cache.Set(chatId, state);
                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var repo = scope.ServiceProvider.GetRequiredService<TransactionRepository>();
                        var cats = await repo.GetCategoriesByTypeAsync(TransactionType.Income, ct);

                        await SendCategoryButtons(botClient, chatId, cats, ct);
                    }
                    break;

                default:
                    if (state.Action != null && state.CategoryId != null)
                    {
                        var (success, amount, type, description) = TransactionParser.ParseManual(state.Action, messageText);

                        if (success)
                        {
                            using (var scope = _scopeFactory.CreateScope())
                            {
                                var repo = scope.ServiceProvider.GetRequiredService<TransactionRepository>();
                                await repo.SaveTransactionAsync(amount, type, state.CategoryId.Value, description);
                            }
                            await botClient.SendTextMessageAsync(chatId, $"✅ {state.Action} de {amount} guardado.", replyMarkup: mainKeyboard);
                            _cache.Remove(chatId);
                        }
                        else
                        {
                            await botClient.SendTextMessageAsync(chatId, "❌ Formato incorrecto. Escribe: 'Monto Comentario' (ej: 12.50 Cena)");
                        }
                    }
                    else
                    {
                        await botClient.SendTextMessageAsync(chatId, "Usa los botones de abajo para empezar.", replyMarkup: mainKeyboard);
                    }
                    break;
            }
        }

        private async Task HandleCallbackAsync(ITelegramBotClient botClient, CallbackQuery callback, CancellationToken ct)
        {
            if (callback.Data != null && callback.Data.StartsWith("cat_"))
            {
                var catId = int.Parse(callback.Data.Split('_')[1]);
                var chatId = callback.Message!.Chat.Id;

                if (_cache.TryGetValue(chatId, out UserState state))
                {
                    state.CategoryId = catId;
                    _cache.Set(chatId, state);

                    // Confirmamos al usuario la selección y pedimos el siguiente dato
                    await botClient.AnswerCallbackQueryAsync(callback.Id, "Categoría seleccionada", cancellationToken: ct);
                    await botClient.SendTextMessageAsync(chatId, "Dime el monto y un comentario (ej: 10 Cafe).", cancellationToken: ct);
                }
            }
        }

        public static class TransactionParser
        {
            public static (bool Success, decimal Amount, TransactionType Type, string Description) ParseManual(string action, string input)
            {
                var parts = input.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length < 1) return (false, 0, 0, "");

                if (!decimal.TryParse(parts[0].Replace(',', '.'), out decimal amount)) return (false, 0, 0, "");

                var type = action.ToLower() == "gasto" ? TransactionType.Expense : TransactionType.Income;
                var desc = parts.Length > 1 ? string.Join(' ', parts.Skip(1)) : "Sin descripción";

                return (true, amount, type, desc);
            }
        }
        private async Task SendCategoryButtons(ITelegramBotClient botClient, long chatId, List<Category> cats, CancellationToken ct)
        {
            var rows = new List<InlineKeyboardButton[]>();
            var columnsPerRow = 2; 

            for (int i = 0; i < cats.Count; i += columnsPerRow)
            {
                
                var row = cats.Skip(i).Take(columnsPerRow).Select(c =>
                    InlineKeyboardButton.WithCallbackData(c.Name, $"cat_{c.Id}")
                ).ToArray();

                rows.Add(row);
            }

            var inlineKeyboard = new InlineKeyboardMarkup(rows);

            await botClient.SendTextMessageAsync(chatId, "Selecciona una categoría:",
                replyMarkup: inlineKeyboard, cancellationToken: ct);
        }
        private Task HandlePollingErrorAsync(ITelegramBotClient botClient, Exception exception, CancellationToken ct)
        {
            Console.WriteLine($"Error de Telegram: {exception.Message}");
            return Task.CompletedTask;
        }
    }
}