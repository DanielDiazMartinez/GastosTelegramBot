using System.ComponentModel.DataAnnotations;

namespace Gastos.Backend.Dtos
{
    public class TriageTransactionDto
    {
        [Required]
        public decimal Amount { get; set; }
        [Required]
        public int CategoryId { get; set; }
        [Required]
        public int Type { get; set; }
        public string? Description { get; set; }
        public DateTime? Date { get; set; }
    }
}
