import { DropzoneRoot } from './dropzone-root';
import { DropzoneArea } from './dropzone-area';
import { DropzonePreview } from './dropzone-preview';

export const Dropzone = Object.assign(DropzoneRoot, {
  Area: DropzoneArea,
  Preview: DropzonePreview,
});
