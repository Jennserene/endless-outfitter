/**
 * Parse node representing a parsed line in the game data format
 */
export interface ParseNode {
  key: string;
  value?: string | number;
  children: ParseNode[];
  lineNumber: number;
}
