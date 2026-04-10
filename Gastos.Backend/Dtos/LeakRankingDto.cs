namespace Gastos.Backend.Dtos
{
    public class LeakRankingDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public decimal CurrentMonthAmount { get; set; }
        public decimal LastMonthAmount { get; set; }
        public double IncreasePercentage { get; set; } 
    }
}
