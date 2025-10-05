import { HeroRoot } from './hero-root';
import { BackgroundImage } from './background-image';
import { TextPanel } from './text-panel';
import { ActionButton } from './action-button';

export const Hero = Object.assign(HeroRoot, {
  Background: BackgroundImage,
  TextPanel,
  ActionButton,
});
