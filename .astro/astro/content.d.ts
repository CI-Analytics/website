declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"welcome-to-ci-analytics.md": {
	id: "welcome-to-ci-analytics.md";
  slug: "welcome-to-ci-analytics";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};
"data": {
"amidus-info.md": {
	id: "amidus-info.md";
  slug: "amidus-info";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"amidus.md": {
	id: "amidus.md";
  slug: "amidus";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"besitzermc.md": {
	id: "besitzermc.md";
  slug: "besitzermc";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"blofy.md": {
	id: "blofy.md";
  slug: "blofy";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"boom.md": {
	id: "boom.md";
  slug: "boom";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"butty.md": {
	id: "butty.md";
  slug: "butty";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"clipsy.md": {
	id: "clipsy.md";
  slug: "clipsy";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"demelus-plus.md": {
	id: "demelus-plus.md";
  slug: "demelus-plus";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"demelus-shorts.md": {
	id: "demelus-shorts.md";
  slug: "demelus-shorts";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"demelus.md": {
	id: "demelus.md";
  slug: "demelus";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"demetrix.md": {
	id: "demetrix.md";
  slug: "demetrix";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"demi-shorts.md": {
	id: "demi-shorts.md";
  slug: "demi-shorts";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"demi.md": {
	id: "demi.md";
  slug: "demi";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"der-test.md": {
	id: "der-test.md";
  slug: "der-test";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"dtm.md": {
	id: "dtm.md";
  slug: "dtm";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"finance-data.md": {
	id: "finance-data.md";
  slug: "finance-data";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"finanzdaten.md": {
	id: "finanzdaten.md";
  slug: "finanzdaten";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"gron.md": {
	id: "gron.md";
  slug: "gron";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"kekskuchen.md": {
	id: "kekskuchen.md";
  slug: "kekskuchen";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"malcado.md": {
	id: "malcado.md";
  slug: "malcado";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"marcu.md": {
	id: "marcu.md";
  slug: "marcu";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"mehr-besitzer.md": {
	id: "mehr-besitzer.md";
  slug: "mehr-besitzer";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"silen.md": {
	id: "silen.md";
  slug: "silen";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"smerchy-shortz.md": {
	id: "smerchy-shortz.md";
  slug: "smerchy-shortz";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"smerchy.md": {
	id: "smerchy.md";
  slug: "smerchy";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"stats-crafter-old.md": {
	id: "stats-crafter-old.md";
  slug: "stats-crafter-old";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"stats-crafter.md": {
	id: "stats-crafter.md";
  slug: "stats-crafter";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"supremeandreal.md": {
	id: "supremeandreal.md";
  slug: "supremeandreal";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"tiimon.md": {
	id: "tiimon.md";
  slug: "tiimon";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"voiett.md": {
	id: "voiett.md";
  slug: "voiett";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"yea-gang.md": {
	id: "yea-gang.md";
  slug: "yea-gang";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
"your-sound-effects.md": {
	id: "your-sound-effects.md";
  slug: "your-sound-effects";
  body: string;
  collection: "data";
  data: InferEntrySchema<"data">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("./../../src/content/config.js");
}
