using Gastos.Backend.Data;
using Gastos.Backend.Dtos;
using Gastos.Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace Gastos.Backend.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionController : ControllerBase
    {
        private readonly TransactionRepository _repository;

        public TransactionController(ApplicationDbContext context)
        {
            _repository = new TransactionRepository(context);
        }

        /// <summary>
        /// Get all transactions
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(List<TransactionDto>), 200)]
        public async Task<IActionResult> GetAllTransactions()   
        {
            var transactions = await _repository.GetAllTransactionsAsync();
            var dtos = transactions.Select(t => MapToDto(t)).ToList();
            return Ok(dtos);
        }

        /// <summary>
        /// Get transaction by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(TransactionDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetTransactionById(Guid id)
        {
            var transaction = await _repository.GetTransactionByIdAsync(id);
            if (transaction == null) return NotFound("Transaction not found");

            return Ok(MapToDto(transaction));
        }

        /// <summary>
        /// Get transactions by type (Expense or Income)
        /// </summary>
        [HttpGet("by-type/{type}")]
        [ProducesResponseType(typeof(List<TransactionDto>), 200)]
        public async Task<IActionResult> GetTransactionsByType(int type)
        {
            if (!Enum.IsDefined(typeof(TransactionType), type))
                return BadRequest("Invalid transaction type");

            var transactionType = (TransactionType)type;
            var transactions = await _repository.GetTransactionsByTypeAsync(transactionType);
            var dtos = transactions.Select(t => MapToDto(t)).ToList();
            return Ok(dtos);
        }

        /// <summary>
        /// Get transactions by date range
        /// </summary>
        [HttpGet("by-date-range")]
        [ProducesResponseType(typeof(List<TransactionDto>), 200)]
        public async Task<IActionResult> GetTransactionsByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            if (startDate > endDate)
                return BadRequest("Start date must be before end date");

            var transactions = await _repository.GetTransactionsByDateRangeAsync(startDate, endDate);
            var dtos = transactions.Select(t => MapToDto(t)).ToList();
            return Ok(dtos);
        }

        /// <summary>
        /// Create a new transaction
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(TransactionDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> CreateTransaction([FromBody] CreateTransactionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!Enum.IsDefined(typeof(TransactionType), dto.Type))
                return BadRequest("Invalid transaction type");

            var transaction = await _repository.CreateTransactionAsync(
                dto.Amount,
                (TransactionType)dto.Type,
                dto.CategoryId,
                dto.Description,
                dto.Date);

            if (transaction == null)
                return BadRequest("Category not found or invalid data");

            return CreatedAtAction(nameof(GetTransactionById), new { id = transaction.Id }, MapToDto(transaction));
        }

        /// <summary>
        /// Update an existing transaction
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(TransactionDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> UpdateTransaction(Guid id, [FromBody] UpdateTransactionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!Enum.IsDefined(typeof(TransactionType), dto.Type))
                return BadRequest("Invalid transaction type");

            var success = await _repository.UpdateTransactionAsync(
                id,
                dto.Amount,
                (TransactionType)dto.Type,
                dto.CategoryId,
                dto.Description,
                dto.Date);

            if (!success)
                return NotFound("Transaction not found or invalid category");

            var transaction = await _repository.GetTransactionByIdAsync(id);
            return Ok(MapToDto(transaction!));
        }

        /// <summary>
        /// Delete a transaction
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteTransaction(Guid id)
        {
            var success = await _repository.DeleteTransactionAsync(id);
            if (!success)
                return NotFound("Transaction not found");

            return NoContent();
        }

        private TransactionDto MapToDto(Transaction transaction)
        {
            return new TransactionDto
            {
                Id = transaction.Id,
                CategoryId = transaction.CategoryId,
                CategoryName = transaction.Category?.Name ?? string.Empty,
                Type = (int)transaction.Type,
                Amount = transaction.Amount,
                Description = transaction.Description,
                Date = transaction.Date
            };
        }
    }
}
