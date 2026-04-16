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
        /// Get income and expense totals within a date range
        /// </summary>
        [HttpGet("income-expense-balance")]
        [ProducesResponseType(typeof(IncomeExpenseBalanceDto), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetIncomeExpenseBalanceByPeriod(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            CancellationToken ct = default)
        {
            if (startDate > endDate)
                return BadRequest("Start date must be before end date");

            try
            {
                var balance = await _repository.GetIncomeExpenseBalanceByPeriodAsync(startDate, endDate, ct);
                return Ok(balance);
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
        /// Get weekly heatmap - expense by day of week
        /// </summary>
        [HttpGet("heatmap/weekly")]
        [ProducesResponseType(typeof(List<DayOfWeekHeatMapDto>), 200)]
        public async Task<IActionResult> GetWeeklyHeatmap()
        {
            var heatmap = await _repository.GetWeeklyHeatmapAsync();
            return Ok(heatmap);
        }

        /// <summary>
        /// Get daily heatmap - expense by day of month
        /// </summary>
        [HttpGet("heatmap/daily")]
        [ProducesResponseType(typeof(List<DayOfMonthStatDto>), 200)]
        public async Task<IActionResult> GetDailyHeatmap(
            [FromQuery] int? month = null,
            [FromQuery] int? year = null)
        {
            if (month.HasValue && (month < 1 || month > 12))
                return BadRequest("Month must be between 1 and 12");

            if (year.HasValue && year < 1900)
                return BadRequest("Year must be valid");

            var heatmap = await _repository.GetStatsByDayOfMonthAsync(month, year);
            return Ok(heatmap);
        }

        /// <summary>
        /// Get monthly heatmap - expense by month of year
        /// </summary>
        [HttpGet("heatmap/monthly")]
        [ProducesResponseType(typeof(List<MonthOfYearHeatMap>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetMonthlyHeatmap([FromQuery] int year)
        {
            if (year < 1900)
                return BadRequest("Year must be valid");

            var heatmap = await _repository.GetStatsByMonthOfYearAsync(year);
            return Ok(heatmap);
        }

        /// <summary>
        /// Get top expense categories (leaks) comparing current month with last month
        /// </summary>
        [HttpGet("top-leaks")]
        [ProducesResponseType(typeof(List<LeakRankingDto>), 200)]
        public async Task<IActionResult> GetTopLeaks([FromQuery] int count = 3)
        {
            if (count < 1 || count > 50)
                return BadRequest("Count must be between 1 and 50");

            var leaks = await _repository.GetTopLeaksAsync(count);
            return Ok(leaks);
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
