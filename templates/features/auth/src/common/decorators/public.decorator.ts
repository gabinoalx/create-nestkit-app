import { IS_PUBLIC_KEY } from "@core/const";
import { SetMetadata } from "@nestjs/common";

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
