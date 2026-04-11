namespace Gastos.Backend.Helpers;

public static class DateTimeHelper
{
    /// <summary>
    /// Convierte un DateTime a UTC, especificando el Kind si es Unspecified
    /// </summary>
    public static DateTime ToUtc(this DateTime dateTime)
    {
        return dateTime.Kind switch
        {
            DateTimeKind.Utc => dateTime,
            DateTimeKind.Unspecified => DateTime.SpecifyKind(dateTime, DateTimeKind.Utc),
            DateTimeKind.Local => dateTime.ToUniversalTime(),
            _ => dateTime
        };
    }

    /// <summary>
    /// Convierte un DateTime nullable a UTC
    /// </summary>
    public static DateTime? ToUtc(this DateTime? dateTime)
    {
        return dateTime?.ToUtc();
    }
}
