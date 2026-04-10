namespace Gastos.Backend.Models;

public class HarvestDetail
{
    public int Id { get; set; }
    public Guid TransactionId { get; set; }
    public string ProductType { get; set; } = "Almendra";
    public decimal QuantityKg { get; set; }
    public decimal PricePerKg { get; set; }
    
    public Transaction Transaction { get; set; } = null!;
}
