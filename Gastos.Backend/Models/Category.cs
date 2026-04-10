namespace Gastos.Backend.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public TransactionType Type { get; set; }
    public bool IsFixed { get; set; } = false;

    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
