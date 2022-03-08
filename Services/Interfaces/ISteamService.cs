using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Core.Models;
using Core.Models.Steam;

namespace Services.Interfaces
{
    public interface ISteamService
    {
        Task<Suspect> GetBanStatusForUser(string steamId);

        Task<List<Suspect>> GetBanStatusForUserList(List<string> users);

        Task<List<Suspect>> GetNewSuspectBannedList(List<string> suspectIdList, List<string> suspectBannedIdList);

        /// <summary>
        /// Return user summary (general information about the account)
        /// </summary>
        /// <param name="users"></param>
        /// <returns></returns>
        Task<List<PlayerSummary>> GetUserSummaryAsync(List<string> users);

        /// <summary>
        /// Call boiler.exe which create a file containing the CMsgGCCStrike15_v2_MatchList message data
        /// </summary>
        /// <param name="ct"></param>
        /// <returns></returns>
        Task<int> GenerateMatchListFile(CancellationToken ct);

        /// <summary>
        /// Download a demo from its share code
        /// </summary>
        /// <param name="shareCode"></param>
        /// <param name="ct"></param>
        /// <returns></returns>
        Task<int> DownloadDemoFromShareCode(string shareCode, CancellationToken ct);

        /// <summary>
        /// Return the SteamID for the given username
        /// see https://wiki.teamfortress.com/wiki/WebAPI/ResolveVanityURL
        /// </summary>
        /// <param name="username"></param>
        /// <returns></returns>
        Task<string> GetSteamIdFromSteamProfileUsername(string username);

        /// <summary>
        /// Return the SteamID from the Steam community URL
        /// If steamUrlOrSteamId is already a SteamID it's symply returned as string
        /// </summary>
        /// <param name="steamUrlOrSteamId"></param>
        /// <returns></returns>
        Task<string> GetSteamIdFromUrlOrSteamId(string steamUrlOrSteamId);
    }
}
