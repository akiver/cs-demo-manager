using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using Services.Interfaces;
using Services.Models.Stats;

namespace Services.Design
{
    public class FlashbangDesignService : IFlashbangService
    {
        public Demo Demo { get; set; }

        public Task<List<FlashbangDataPoint>> GetPlayersFlashTimesData()
        {
            List<FlashbangDataPoint> data = new List<FlashbangDataPoint>();

            Random rand = new Random();

            for (int i = 1; i <= 10; i++)
            {
                for (int j = 1; j <= 10; j++)
                {
                    data.Add(new FlashbangDataPoint
                    {
                        Flasher = "Player " + i,
                        Flashed = "Player " + j,
                        Duration = rand.Next(0, 8),
                    });
                }
            }

            return Task.FromResult(data);
        }

        public Task<List<FlashbangDataPoint>> GetTeamsFlashTimesData()
        {
            List<FlashbangDataPoint> data = new List<FlashbangDataPoint>();

            Random rand = new Random();

            for (int i = 1; i <= 2; i++)
            {
                for (int j = 1; j <= 2; j++)
                {
                    data.Add(new FlashbangDataPoint
                    {
                        Flasher = "Team " + i,
                        Flashed = "Team " + j,
                        Duration = rand.Next(0, 8),
                    });
                }
            }

            return Task.FromResult(data);
        }

        public Task<List<FlashbangDataPoint>> GetAverageFlashTimesPlayersData()
        {
            List<FlashbangDataPoint> data = new List<FlashbangDataPoint>();

            Random rand = new Random();

            for (int i = 1; i <= 10; i++)
            {
                data.Add(new FlashbangDataPoint
                {
                    Flasher = "Player " + i,
                    Flashed = "fakeplayer",
                    Duration = rand.Next(0, 8),
                });
            }

            return Task.FromResult(data);
        }
    }
}
