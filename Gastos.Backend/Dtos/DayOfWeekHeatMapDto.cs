namespace Gastos.Backend.Dtos
{
    public class DayOfWeekHeatMapDto
    {
        public string DayOfWeek { get; set; } = string.Empty; 
        public decimal TotalAmount { get; set; }
        public int TransactionCount { get; set; }
    }
}
