using Gastos.Backend.Data;
using Gastos.Backend.Dtos;
using Gastos.Backend.Helpers;
using Gastos.Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;


public class TransactionRepository
{
    private readonly ApplicationDbContext _context;

    public TransactionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> SaveTransactionAsync(decimal amount, TransactionType type, int categoryId, string description)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == categoryId);

        if (category == null) return false;

        var transaction = new Transaction
        {
            Amount = amount,
            Type = type,
            CategoryId = category.Id,
            Description = description
        };

        _context.Transactions.Add(transaction);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<Transaction?> GetTransactionByIdAsync(Guid id)
    {
        return await _context.Transactions
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<List<Transaction>> GetAllTransactionsAsync()
    {
        return await _context.Transactions
            .Include(t => t.Category)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    public async Task<List<Transaction>> GetTransactionsByTypeAsync(TransactionType type)
    {
        return await _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.Type == type)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    public async Task<List<Transaction>> GetTransactionsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var start = startDate.ToUtc();
        var end = endDate.ToUtc();

        return await _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.Date >= start && t.Date <= end)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    public async Task<Transaction?> CreateTransactionAsync(decimal amount, TransactionType type, int categoryId, string? description, DateTime? date)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == categoryId);

        if (category == null) return null;

        var transaction = new Transaction
        {
            Amount = amount,
            Type = type,
            CategoryId = category.Id,
            Description = description,
            Date = date?.ToUtc() ?? DateTime.UtcNow
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
        return transaction;
    }

    public async Task<bool> UpdateTransactionAsync(Guid id, decimal amount, TransactionType type, int categoryId, string? description, DateTime? date)
    {
        var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == id);
        if (transaction == null) return false;

        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == categoryId);
        if (category == null) return false;

        transaction.Amount = amount;
        transaction.Type = type;
        transaction.CategoryId = categoryId;
        transaction.Description = description;

        if (date.HasValue)
        {
            transaction.Date = date.Value.ToUtc();
        }

        _context.Transactions.Update(transaction);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteTransactionAsync(Guid id)
    {
        var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == id);
        if (transaction == null) return false;

        _context.Transactions.Remove(transaction);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<List<CategoryStatDto>> GetCategoryStatsByPeriodAsync(
    DateTime startDate,
    DateTime endDate,
    CancellationToken ct = default)
    {
        var start = startDate.ToUtc();
        var endOfPeriod = endDate.ToUtc().AddDays(1).AddTicks(-1);

        var categoryData = await _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.Type == TransactionType.Expense &&
                        t.Date >= start &&
                        t.Date <= endOfPeriod)
            .GroupBy(t => t.Category.Name)
            .Select(g => new
            {
                Name = g.Key,
                Amount = g.Sum(t => t.Amount)
            })
            .ToListAsync(ct);

        decimal totalPeriodAmount = categoryData.Sum(x => x.Amount);

        return categoryData.Select(x => new CategoryStatDto
        {
            CategoryName = x.Name,
            TotalAmount = x.Amount,
            Percentage = totalPeriodAmount > 0
                ? (double)((x.Amount / totalPeriodAmount) * 100)
                : 0,
            Color = GetColorForCategory(x.Name)
        })
        .OrderByDescending(x => x.TotalAmount)
        .ToList();
    }

    public async Task<List<IncomeExpenseBalanceDto>> GetMonthlyIncomeExpenseBalanceByYearAsync(
        int year,
        CancellationToken ct = default)
    {
        var start = new DateTime(year, 1, 1).ToUtc();
        var endOfYear = new DateTime(year, 12, 31).ToUtc().AddDays(1).AddTicks(-1);

        var monthlyTotals = await _context.Transactions
            .Where(t => t.Date >= start && t.Date <= endOfYear)
            .GroupBy(t => t.Date.Month)
            .Select(g => new
            {
                Month = g.Key,
                Ingresos = g.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                Gastos = g.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount)
            })
            .ToListAsync(ct);

        var monthlyTotalsByMonth = monthlyTotals.ToDictionary(x => x.Month);
        var culture = CultureInfo.GetCultureInfo("es-ES");

        return Enumerable.Range(1, 12)
            .Select(month =>
            {
                monthlyTotalsByMonth.TryGetValue(month, out var totals);

                return new IncomeExpenseBalanceDto
                {
                    Name = new DateTime(year, month, 1).ToString("MMM", culture).Replace(".", string.Empty),
                    Ingresos = totals?.Ingresos ?? 0,
                    Gastos = totals?.Gastos ?? 0
                };
            })
            .ToList();
    }

    public async Task<List<Category>> GetCategoriesByTypeAsync(TransactionType type, CancellationToken ct = default)
    {
        return await _context.Categories
            .Where(c => c.Type == type)
            .ToListAsync(ct);
    }

    private string GetColorForCategory(string categoryName)
    {
        return categoryName.ToLower() switch
        {
            "comida" => "#FF6384",
            "comidafuera" => "#FF9AA2",
            "comidadomicilio" => "#FFB7B2",

            "gasolina" => "#36A2EB",
            "transporte" => "#4D96FF",

            "ropa" => "#8AC926",
            "regalos" => "#C77DFF",

            "alquiler" => "#4BC0C0",
            "gastoshogar" => "#2EC4B6",
            "telefono" => "#5E60CE",

            "salud/ejercicio" => "#FF595E",

            "dineroprestado" => "#6A4C93",
            "inversion" => "#1982C4",
            "educacion" => "#FF9F40",

            "nomina" => "#2ECC71",   
            "familia" => "#52B788",   

            "otros" => "#ADB5BD",

            _ => "#C9CBCF"
        };
    }

}