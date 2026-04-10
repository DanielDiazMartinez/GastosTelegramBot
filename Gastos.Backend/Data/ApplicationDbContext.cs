using Gastos.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Gastos.Backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Category> Categories { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<HarvestDetail> HarvestDetails { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Category>().ToTable("Categories");
        modelBuilder.Entity<Transaction>().ToTable("Transactions");
        modelBuilder.Entity<HarvestDetail>().ToTable("HarvestDetails");

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Amount).HasPrecision(12, 2);
            entity.Property(e => e.Date).HasDefaultValueSql("CURRENT_TIMESTAMP");


            entity.HasOne(e => e.Category)
                .WithMany(c => c.Transactions)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HarvestDetail>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.QuantityKg).HasPrecision(12, 2);
            entity.Property(e => e.PricePerKg).HasPrecision(12, 2);

            entity.HasOne(e => e.Transaction)
                .WithOne(t => t.HarvestDetail)
                .HasForeignKey<HarvestDetail>(e => e.TransactionId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}