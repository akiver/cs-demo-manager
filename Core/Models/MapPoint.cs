namespace Core.Models
{
    public class MapPoint
    {
        public float X { get; set; }

        public float Y { get; set; }

        public override bool Equals(object obj)
        {
            var item = (MapPoint)obj;

            if (item == null)
            {
                return false;
            }

            return X.Equals(item.X) && Y.Equals(item.Y);
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }
    }
}
