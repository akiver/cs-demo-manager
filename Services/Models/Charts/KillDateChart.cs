using System;

namespace Services.Models.Charts
{
    public class KillDateChart
    {
        public double KillAverage { get; set; }
        public double DeathAverage { get; set; }

        public double Ratio
        {
            get
            {
                if (KillAverage > 0 && DeathAverage > 0)
                {
                    return Math.Round(KillAverage / DeathAverage, 2);
                }

                return 0;
            }
        }

        public DateTime Date { get; set; }
    }
}
