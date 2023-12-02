import React from 'react';
import { Trans } from '@lingui/macro';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { DEFAULT_FFMPEG_CONSTANT_RATE_FACTOR } from 'csdm/ui/settings/video/default-values';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

export function ConstantRateFactorInput() {
  const { settings, updateSettings } = useVideoSettings();
  const minValue = 0;
  const maxValue = 51;

  const onBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    let newConstantRateFactor = value === '' ? DEFAULT_FFMPEG_CONSTANT_RATE_FACTOR : Number(value);
    if (newConstantRateFactor < 0) {
      newConstantRateFactor = DEFAULT_FFMPEG_CONSTANT_RATE_FACTOR;
    } else if (newConstantRateFactor > maxValue) {
      newConstantRateFactor = maxValue;
    }

    event.target.value = newConstantRateFactor.toString();

    await updateSettings({
      ffmpegSettings: {
        constantRateFactor: newConstantRateFactor,
      },
    });
  };

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel
        htmlFor="crf"
        helpTooltip={
          <Trans context="Tooltip">
            Impact the video quality, from 0 to 51 with 0 for the best quality resulting in a larger file
          </Trans>
        }
      >
        <Trans context="Input label">Quality</Trans>
      </InputLabel>
      <InputNumber
        key={settings.ffmpegSettings.constantRateFactor}
        id="crf"
        min={minValue}
        max={maxValue}
        onBlur={onBlur}
        defaultValue={settings.ffmpegSettings.constantRateFactor}
        placeholder={String(DEFAULT_FFMPEG_CONSTANT_RATE_FACTOR)}
      />
    </div>
  );
}
