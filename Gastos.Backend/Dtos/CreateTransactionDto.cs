namespace Gastos.Backend.Dtos
{
    public class CreateTransactionDto
    {
        public int CategoryId { get; set; }
        public int Type { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime? Date { get; set; }
    }
}
