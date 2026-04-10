using Gastos.Backend.Data;
using Gastos.Backend.Dtos;
using Gastos.Backend.Models;
using Microsoft.EntityFrameworkCore;


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
        return await _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.Date >= startDate && t.Date <= endDate)
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
            Date = date ?? DateTime.UtcNow
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
        if (date.HasValue) transaction.Date = date.Value;

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
        var endOfPeriod = endDate.Date.AddDays(1).AddTicks(-1);

        var categoryData = await _context.Transactions
            .Where(t => t.Type == TransactionType.Expense &&
                        t.Date >= startDate.Date &&
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

    public async Task<List<Category>> GetCategoriesByTypeAsync(TransactionType type, CancellationToken ct = default)
    {
        return await _context.Categories
            .Where(c => c.Type == type)
            .ToListAsync(ct);
    }

    public async Task<List<DayOfWeekHeatMapDto>> GetWeeklyHeatmapAsync()
    {
        return await _context.Transactions
            .Where(t => t.Type == TransactionType.Expense)
            .GroupBy(t => t.Date.DayOfWeek)
            .Select(g => new DayOfWeekHeatMapDto
            {
                DayOfWeek = g.Key.ToString(),
                TotalAmount = g.Sum(t => t.Amount),
                TransactionCount = g.Count()
            })
            .ToListAsync();
    }

    public async Task<List<DayOfMonthStatDto>> GetStatsByDayOfMonthAsync(int? month = null, int? year = null)
    {
        var query = _context.Transactions
            .Where(t => t.Type == TransactionType.Expense);

        if (month.HasValue && year.HasValue)
        {
            query = query.Where(t => t.Date.Month == month && t.Date.Year == year);
        }

        return await query
            .GroupBy(t => t.Date.Day)
            .Select(g => new DayOfMonthStatDto
            {
                Day = g.Key,
                TotalAmount = g.Sum(t => t.Amount)
            })
            .OrderBy(x => x.Day)
            .ToListAsync();
    }

    public async Task<List<MonthOfYearHeatMap>> GetStatsByMonthOfYearAsync(int year)
    {
        return await _context.Transactions
            .Where(t => t.Type == TransactionType.Expense && t.Date.Year == year)
            .GroupBy(t => t.Date.Month)
            .Select(g => new MonthOfYearHeatMap
            {
                Month = g.Key,
                TotalAmount = g.Sum(t => t.Amount)
            })
            .OrderBy(x => x.Month)
            .ToListAsync();
    }

    private string GetColorForCategory(string categoryName)
    {
        return categoryName.ToLower() switch
        {
            "comida" => "#FF6384",
            "transporte" => "#36A2EB",
            "ocio" => "#FFCE56",
            "alquiler" => "#4BC0C0",
            _ => "#C9CBCF"
        };
    }

    public async Task<List<LeakRankingDto>> GetTopLeaksAsync(int count = 3)
    {
        var now = DateTime.Now;
        var currentMonthStart = new DateTime(now.Year, now.Month, 1);
        var lastMonthStart = currentMonthStart.AddMonths(-1);
        var lastMonthEnd = currentMonthStart.AddTicks(-1);

        var transactions = await _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.Type == TransactionType.Expense
                        && !t.Category.IsFixed
                        && t.Date >= lastMonthStart)
            .ToListAsync();

        var ranking = transactions
            .GroupBy(t => t.Category.Name)
            .Select(g => {
                var currentAmount = g.Where(t => t.Date >= currentMonthStart).Sum(t => t.Amount);
                var lastAmount = g.Where(t => t.Date <= lastMonthEnd).Sum(t => t.Amount);

                return new LeakRankingDto
                {
                    CategoryName = g.Key,
                    CurrentMonthAmount = currentAmount,
                    LastMonthAmount = lastAmount,
                    IncreasePercentage = lastAmount > 0
                        ? (double)((currentAmount - lastAmount) / lastAmount * 100)
                        : (currentAmount > 0 ? 100 : 0)
                };
            })
            .Where(x => x.IncreasePercentage > 0)
            .OrderByDescending(x => x.IncreasePercentage)
            .Take(count)
            .ToList();

        return ranking;
    }
}