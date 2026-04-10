namespace Gastos.Backend.Dtos
{
    public class CategoryStatDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public double Percentage { get; set; }
        public string Color { get; set; } 
    }
}
