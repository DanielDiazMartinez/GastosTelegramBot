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
            .Where(t => t.Status != TransactionStatus.PendingTriage)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    public async Task<List<Transaction>> GetPendingTriageTransactionsAsync()
    {
        return await _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.Status == TransactionStatus.PendingTriage)
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


    public async Task<bool> ConfirmTriageTransactionAsync(Guid id, ConfirmTriageTransactionDto dto)
    {
        var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == id);
        if (transaction == null) return false;

        if (transaction.Status != TransactionStatus.PendingTriage) return false; // Only confirm pending triage transactions

        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == dto.CategoryId);
        if (category == null) return false;

        transaction.Amount = dto.Amount;
        transaction.Type = (TransactionType)dto.Type;
        transaction.CategoryId = dto.CategoryId;
        transaction.Description = dto.Description;
        transaction.Status = TransactionStatus.Approved;

        if (dto.Date.HasValue)
        {
            transaction.Date = dto.Date.Value.ToUtc();
        }

        _context.Transactions.Update(transaction);
        return await _context.SaveChangesAsync() > 0;
    }
}
