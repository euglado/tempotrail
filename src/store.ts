import { randomBytes } from "node:crypto";
import type { Language, Plan } from "./plan.js";

export type Binding = { owner: string; guild: string; channel: string };
export type Draft = Binding & {
  plan: Plan;
  language: Language;
  message: string | null;
  expires: number;
};

export class Store {
  readonly drafts = new Map<string, Draft>();
  readonly users = new Map<string, number>();
  readonly channels = new Map<string, number>();
  constructor(
    private readonly now: () => number = Date.now,
    private readonly nonce: () => string = () =>
      randomBytes(18).toString("hex"),
  ) {}
  prune(): void {
    const now = this.now();
    for (const [key, draft] of this.drafts) {
      if (draft.expires <= now) this.drafts.delete(key);
    }
    for (const map of [this.users, this.channels]) {
      for (const [key, until] of map) if (until <= now) map.delete(key);
    }
  }
  create(binding: Binding, plan: Plan, language: Language): string | null {
    this.prune();
    if (
      this.drafts.size >= 100 ||
      this.users.has(binding.owner) ||
      this.users.size >= 500
    )
      return null;
    const key = this.nonce();
    if (!/^[a-f0-9]{36}$/.test(key) || this.drafts.has(key))
      throw Error("Invalid nonce");
    this.users.set(binding.owner, this.now() + 5_000);
    this.drafts.set(key, {
      ...binding,
      plan,
      language,
      message: null,
      expires: this.now() + 300_000,
    });
    return key;
  }
  bind(key: string, message: string): boolean {
    const draft = this.drafts.get(key);
    if (!draft || draft.message !== null || draft.expires <= this.now())
      return false;
    draft.message = message;
    return true;
  }
  take(key: string, binding: Binding, message: string): Draft | null {
    this.prune();
    const draft = this.drafts.get(key);
    if (
      !draft ||
      draft.owner !== binding.owner ||
      draft.guild !== binding.guild ||
      draft.channel !== binding.channel ||
      draft.message !== message
    )
      return null;
    this.drafts.delete(key);
    return draft;
  }
  reserveChannel(channel: string): boolean {
    this.prune();
    if (this.channels.has(channel) || this.channels.size >= 500) return false;
    this.channels.set(channel, this.now() + 60_000);
    return true;
  }
  clear(): void {
    this.drafts.clear();
    this.users.clear();
    this.channels.clear();
  }
}
