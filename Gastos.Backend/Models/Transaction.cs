namespace Gastos.Backend.Models;

public enum TransactionType
{
    Expense = 0,    
    Income = 1      
}

public class Transaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int CategoryId { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;

    public Category Category { get; set; } = null!;
    public HarvestDetail? HarvestDetail { get; set; }
}
