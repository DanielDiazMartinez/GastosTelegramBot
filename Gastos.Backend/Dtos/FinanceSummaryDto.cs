namespace Gastos.Backend.Dtos
{
    public class FinanceSummaryDto
    {
        public decimal BalanceTotal { get; set; } 
        public decimal MonthlyBudgetUsage { get; set; } 
        public decimal SavingsRate { get; set; } 
        public int TransactionsCount { get; set; }
    }
}
