using System.Windows.Media.Imaging;
using Core.Models;

namespace Services.Interfaces
{
    public interface IMapService
    {
        Map Map { get; set; }

        void InitMap(Demo demo);

        WriteableBitmap GetWriteableImage(bool useSimpleRadar = true);

        float CalculatePointToResolutionX(float x);

        float CalculatePointToResolutionY(float y);
    }
}
