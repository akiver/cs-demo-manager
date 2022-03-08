namespace Core.Models
{
    public class Account
    {
        public string SteamId { set; get; }

        public string Name { get; set; }

        public override string ToString()
        {
            return Name + " (" + SteamId + ")";
        }
    }
}
