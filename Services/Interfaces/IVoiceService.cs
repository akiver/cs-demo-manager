using System.Threading;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IVoiceService
    {
        Task ExportPlayersVoice(string demoPath, string outputFolderPath, CancellationToken ct);
    }
}
