import { MinimalPersonaSnapshot } from "@/app/admin/assistants/interfaces";
import { FeedbackType } from "../../interfaces";
import { Packet } from "../../services/streamingModels";
import { AlvioDocument, MinimalAlvioDocument } from "@/lib/search/interfaces";
import { ProjectFile } from "../../projects/projectsService";
import { LlmDescriptor } from "@/lib/hooks";
import { IconType } from "react-icons";
import { AlvioIconType } from "@/components/icons/icons";

export enum RenderType {
  HIGHLIGHT = "highlight",
  FULL = "full",
}

export interface FullChatState {
  handleFeedback: (feedback: FeedbackType) => void;
  assistant: MinimalPersonaSnapshot;
  // Document-related context for citations
  docs?: AlvioDocument[] | null;
  userFiles?: ProjectFile[];
  citations?: { [key: string]: number };
  setPresentingDocument?: (document: MinimalAlvioDocument) => void;
  // Regenerate functionality
  regenerate?: (modelOverRide: LlmDescriptor) => Promise<void>;
  overriddenModel?: string;
}

export interface RendererResult {
  icon: IconType | AlvioIconType | null;
  status: string | null;
  content: JSX.Element;

  // can be used to override the look on the "expanded" view
  // used for things that should just show text w/o an icon or header
  // e.g. ReasoningRenderer
  expandedText?: JSX.Element;
}

export type MessageRenderer<
  T extends Packet,
  S extends Partial<FullChatState>,
> = React.ComponentType<{
  packets: T[];
  state: S;
  onComplete: () => void;
  renderType: RenderType;
  animate: boolean;
  stopPacketSeen: boolean;
  children: (result: RendererResult) => JSX.Element;
}>;
