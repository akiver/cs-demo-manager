using Core.Models.Events;

namespace Core.Models
{
    public class PositionPoint : MapPoint
    {
        public int RoundNumber { get; set; }

        public int Color { get; set; }

        public Side Team { get; set; }

        public long PlayerSteamId { get; set; }

        public string PlayerName { get; set; }

        public bool PlayerHasBomb { get; set; }

        public BaseEvent Event { get; set; }

        public override bool Equals(object obj)
        {
            if (obj.GetType() == typeof(PositionPoint))
            {
                var item = (PositionPoint)obj;

                return X.Equals(item.X) && Y.Equals(item.Y) && RoundNumber == item.RoundNumber;
            }

            return false;
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }

        public PositionPoint Clone()
        {
            return (PositionPoint)MemberwiseClone();
        }
    }
}
