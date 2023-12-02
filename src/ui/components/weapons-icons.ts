import type { SVGAttributes } from 'react';
import { WeaponName } from 'csdm/common/types/counter-strike';
import { AK47Icon } from 'csdm/ui/icons/weapons/ak47-icon';
import { AUGIcon } from 'csdm/ui/icons/weapons/aug-icon';
import { AWPIcon } from 'csdm/ui/icons/weapons/awp-icon';
import { BizonIcon } from 'csdm/ui/icons/weapons/bizon-icon';
import { CZ75AIcon } from 'csdm/ui/icons/weapons/cz75a-icon';
import { DeagleIcon } from 'csdm/ui/icons/weapons/deagle-icon';
import { DecoyIcon } from 'csdm/ui/icons/weapons/decoy-icon';
import { DefuserIcon } from 'csdm/ui/icons/weapons/defuser-icon';
import { DualEliteIcon } from 'csdm/ui/icons/weapons/dual-elite-icon';
import { FamasIcon } from 'csdm/ui/icons/weapons/famas-icon';
import { FiveSevenIcon } from 'csdm/ui/icons/weapons/five-seven-icon';
import { FlashbangIcon } from 'csdm/ui/icons/weapons/flashbang-icon';
import { G3SG1Icon } from 'csdm/ui/icons/weapons/g3sg1-icon';
import { GalilarIcon } from 'csdm/ui/icons/weapons/galilar-icon';
import { GlockIcon } from 'csdm/ui/icons/weapons/glock-icon';
import { HeGrenadeIcon } from 'csdm/ui/icons/weapons/he-grenade-icon';
import { IncendiaryGrenadeIcon } from 'csdm/ui/icons/weapons/incendiary-grenade-icon';
import { KevlarIcon } from 'csdm/ui/icons/weapons/kevlar-icon';
import { HelmetIcon } from 'csdm/ui/icons/weapons/helmet-icon';
import { KnifeIcon } from 'csdm/ui/icons/weapons/knife-icon';
import { M249Icon } from 'csdm/ui/icons/weapons/m249-icon';
import { M4A1Icon } from 'csdm/ui/icons/weapons/m4a1-icon';
import { M4A4Icon } from 'csdm/ui/icons/weapons/m4a4-icon';
import { Mac10Icon } from 'csdm/ui/icons/weapons/mac10-icon';
import { Mag7Icon } from 'csdm/ui/icons/weapons/mag7-icon';
import { MolotovIcon } from 'csdm/ui/icons/weapons/molotov-icon';
import { MP5SDIcon } from 'csdm/ui/icons/weapons/mp5sd-icon';
import { MP7Icon } from 'csdm/ui/icons/weapons/mp7-icon';
import { MP9Icon } from 'csdm/ui/icons/weapons/mp9-icon';
import { NegevIcon } from 'csdm/ui/icons/weapons/negev-icon';
import { NovaIcon } from 'csdm/ui/icons/weapons/nova-icon';
import { P2000Icon } from 'csdm/ui/icons/weapons/p2000-icon';
import { P250Icon } from 'csdm/ui/icons/weapons/p250-icon';
import { P90Icon } from 'csdm/ui/icons/weapons/p90-icon';
import { RevolverIcon } from 'csdm/ui/icons/weapons/revolver-icon';
import { SawedOffIcon } from 'csdm/ui/icons/weapons/sawed-off-icon';
import { Scar20Icon } from 'csdm/ui/icons/weapons/scar20-icon';
import { SG553Icon } from 'csdm/ui/icons/weapons/sg553-icon';
import { SmokeGrenadeIcon } from 'csdm/ui/icons/weapons/smoke-grenade-icon';
import { SSG08Icon } from 'csdm/ui/icons/weapons/ssg08-icon';
import { Tec9Icon } from 'csdm/ui/icons/weapons/tec9-icon';
import { UMP45Icon } from 'csdm/ui/icons/weapons/ump45-icon';
import { USPSIcon } from 'csdm/ui/icons/weapons/usps-icon';
import { WorldIcon } from 'csdm/ui/icons/weapons/world-icon';
import { XM1014Icon } from 'csdm/ui/icons/weapons/xm1014-icon';
import { ZeusIcon } from 'csdm/ui/icons/weapons/zeus-icon';
import { QuestionIcon } from '../icons/question-icon';
import { BombIcon } from '../icons/weapons/bomb-icon';

export const WEAPONS_ICONS: Record<WeaponName, (props: SVGAttributes<SVGElement>) => React.ReactElement> = {
  [WeaponName.AK47]: AK47Icon,
  [WeaponName.AUG]: AUGIcon,
  [WeaponName.AWP]: AWPIcon,
  [WeaponName.Bomb]: BombIcon,
  [WeaponName.CZ75]: CZ75AIcon,
  [WeaponName.Decoy]: DecoyIcon,
  [WeaponName.DefuseKit]: DefuserIcon,
  [WeaponName.Deagle]: DeagleIcon,
  [WeaponName.DualBerettas]: DualEliteIcon,
  [WeaponName.Famas]: FamasIcon,
  [WeaponName.FiveSeven]: FiveSevenIcon,
  [WeaponName.Flashbang]: FlashbangIcon,
  [WeaponName.G3SG1]: G3SG1Icon,
  [WeaponName.GalilAR]: GalilarIcon,
  [WeaponName.Glock]: GlockIcon,
  [WeaponName.HEGrenade]: HeGrenadeIcon,
  [WeaponName.Incendiary]: IncendiaryGrenadeIcon,
  [WeaponName.Kevlar]: KevlarIcon,
  [WeaponName.Helmet]: HelmetIcon,
  [WeaponName.Knife]: KnifeIcon,
  [WeaponName.M249]: M249Icon,
  [WeaponName.M4A1]: M4A1Icon,
  [WeaponName.M4A4]: M4A4Icon,
  [WeaponName.Mac10]: Mac10Icon,
  [WeaponName.MAG7]: Mag7Icon,
  [WeaponName.MP5]: MP5SDIcon,
  [WeaponName.MP7]: MP7Icon,
  [WeaponName.MP9]: MP9Icon,
  [WeaponName.Molotov]: MolotovIcon,
  [WeaponName.Negev]: NegevIcon,
  [WeaponName.Nova]: NovaIcon,
  [WeaponName.P2000]: P2000Icon,
  [WeaponName.P250]: P250Icon,
  [WeaponName.P90]: P90Icon,
  [WeaponName.PPBizon]: BizonIcon,
  [WeaponName.Revolver]: RevolverIcon,
  [WeaponName.SawedOff]: SawedOffIcon,
  [WeaponName.Scar20]: Scar20Icon,
  [WeaponName.SG553]: SG553Icon,
  [WeaponName.Smoke]: SmokeGrenadeIcon,
  [WeaponName.Scout]: SSG08Icon,
  [WeaponName.Tec9]: Tec9Icon,
  [WeaponName.UMP45]: UMP45Icon,
  [WeaponName.Unknown]: QuestionIcon,
  [WeaponName.USP]: USPSIcon,
  [WeaponName.World]: WorldIcon,
  [WeaponName.XM1014]: XM1014Icon,
  [WeaponName.Zeus]: ZeusIcon,
};
