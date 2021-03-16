// MAKE ALL PROPERTIES PICKED FROM TYPE OPTIONAL
export type PartialPick<T, K extends keyof T> = {
	[P in K]?: T[P];
};

// REQUIRE ALL PROPERTIES FROM TYPE BUT MAKE ONES SELECTED OPTIONAL
export type CopyWithPartial<T, K extends keyof T> = Omit<T, K> & Partial<T>;
