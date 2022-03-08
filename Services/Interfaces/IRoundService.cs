using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using Services.Models.Timelines;

namespace Services.Interfaces
{
    public interface IRoundService
    {
        /// <summary>
        /// Return round's events (used for timeline)
        /// </summary>
        /// <param name="demo"></param>
        /// <param name="round"></param>
        /// <returns></returns>
        Task<List<TimelineEvent>> GetTimeLineEventList(Demo demo, Round round);

        /// <summary>
        /// Map the round values to the player stats at this round
        /// </summary>
        /// <param name="demo"></param>
        /// <param name="round"></param>
        /// /// <param name="playerSteamId"></param>
        /// <returns></returns>
        Task<Round> MapRoundValuesToSelectedPlayer(Demo demo, Round round, long playerSteamId = 0);
    }
}
