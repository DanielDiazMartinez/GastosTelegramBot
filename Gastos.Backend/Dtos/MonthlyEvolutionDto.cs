namespace Gastos.Backend.Dtos
{
    public class MonthlyEvolutionDto
    {
        public string MonthName { get; set; } = string.Empty;
        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal NetSavings => TotalIncome - TotalExpense;
    }
}
