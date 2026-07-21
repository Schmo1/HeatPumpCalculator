namespace HeatPumpCalculator.Api.Models;

/// <summary>
/// Entspricht einer Zeile im Excel-Blatt "Wasser Verbrauch".
/// Speichert die abgelesenen Zählerstände; Verbräuche und Verhältnisse
/// werden im CalculationService aus der Differenz zum Vorzeitraum berechnet.
///
/// Hinweis: Sarahs Zähler (Wohnung 2) zählen rückwärts ab 100000,
/// daher wird ihr Verbrauch als (Vorwert - aktueller Wert) berechnet.
/// </summary>
public class WaterPeriod
{
    public int Id { get; set; }

    /// <summary>Bezeichnung, z.B. "Init" oder "2025/1".</summary>
    public string Label { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    /// <summary>
    /// Basiszeile (z.B. "Init"): dient nur als Ausgangs-Zählerstand,
    /// erzeugt selbst keinen Verbrauch und erscheint nicht in Auswertungen.
    /// </summary>
    public bool IsBaseline { get; set; }

    /// <summary>Zählerstand Gesamtwasser (Hauptzähler).</summary>
    public double? TotalMeterReading { get; set; }

    /// <summary>Zählerstand Kaltwasser David (Wohnung 1), steigend.</summary>
    public double? DavidColdReading { get; set; }

    /// <summary>Zählerstand Warmwasser David (Wohnung 1), steigend.</summary>
    public double? DavidWarmReading { get; set; }

    /// <summary>Zählerstand Kaltwasser Sarah (Wohnung 2), fallend ab 100000.</summary>
    public double? SarahColdReading { get; set; }

    /// <summary>Zählerstand Warmwasser Sarah (Wohnung 2), fallend ab 100000.</summary>
    public double? SarahWarmReading { get; set; }
}
