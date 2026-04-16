using Gastos.Backend.Data;
using Gastos.Backend.Dtos;
using Gastos.Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace Gastos.Backend.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatsController : ControllerBase
    {
        private readonly TransactionRepository _repository;

        public StatsController(ApplicationDbContext context)
        {
            _repository = new TransactionRepository(context);
        }

        /// <summary>
        /// Get expense by categories within a date range
        /// </summary>
        [HttpGet("category-stats")]
        [ProducesResponseType(typeof(List<CategoryStatDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetCategoryStatsByPeriod(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            CancellationToken ct = default)
        {
            if (startDate > endDate)
                return BadRequest("Start date must be before end date");

            try
            {
                var stats = await _repository.GetCategoryStatsByPeriodAsync(startDate, endDate, ct);
                return Ok(stats);
            }
            catch (OperationCanceledException)
            {
                return StatusCode(408, "Request timeout");
            }
        }

        /// <summary>
        /// Get monthly income and expense totals for a full year
        /// </summary>
        [HttpGet("income-expense-balance/yearly")]
        [ProducesResponseType(typeof(List<IncomeExpenseBalanceDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetYearlyIncomeExpenseBalance(
            [FromQuery] int year,
            CancellationToken ct = default)
        {
            if (year < 1900)
                return BadRequest("Year must be valid");

            try
            {
                var balance = await _repository.GetMonthlyIncomeExpenseBalanceByYearAsync(year, ct);
                return Ok(balance);
            }
            catch (OperationCanceledException)
            {
                return StatusCode(408, "Request timeout");
            }
        }

        /// <summary>
        /// Get yearly finance summary indicators
        /// </summary>
        [HttpGet("summary/yearly")]
        [ProducesResponseType(typeof(FinanceSummaryDto), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetYearlyFinanceSummary(
            [FromQuery] int year,
            CancellationToken ct = default)
        {
            if (year < 1900)
                return BadRequest("Year must be valid");

            try
            {
                var summary = await _repository.GetFinanceSummaryByYearAsync(year, ct);
                return Ok(summary);
            }
            catch (OperationCanceledException)
            {
                return StatusCode(408, "Request timeout");
            }
        }

        /// <summary>
        /// Get categories by type (Expense or Income)
        /// </summary>
        [HttpGet("categories")]
        [ProducesResponseType(typeof(List<Category>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetCategoriesByType(
            [FromQuery] int type,
            CancellationToken ct = default)
        {
            if (!Enum.IsDefined(typeof(TransactionType), type))
                return BadRequest("Invalid transaction type");

            try
            {
                var categories = await _repository.GetCategoriesByTypeAsync((TransactionType)type, ct);
                return Ok(categories);
            }
            catch (OperationCanceledException)
            {
                return StatusCode(408, "Request timeout");
            }
        }


    }
}
