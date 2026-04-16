namespace Gastos.Backend.Dtos
{
    public class IncomeExpenseBalanceDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Ingresos { get; set; }
        public decimal Gastos { get; set; }
    }
}