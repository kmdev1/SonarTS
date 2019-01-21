/*
 * SonarTS
 * Copyright (C) 2017-2019 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as ts from "typescript";
import { is } from "./nodes";

// compare literals and identifiers by actual text
const COMPARED_BY_TEXT = new Set([
  ts.SyntaxKind.NumericLiteral,
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.RegularExpressionLiteral,
  ts.SyntaxKind.Identifier,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.TemplateHead,
  ts.SyntaxKind.TemplateMiddle,
  ts.SyntaxKind.TemplateTail,
  ts.SyntaxKind.JsxText,
]);

/**
 *
 * @param first
 * @param second
 * @param ignoreLiterals when true, two nodes are considered equivalent even if string or numeric literals have different value
 */
export default function areEquivalent(
  first: ts.Node | ts.Node[],
  second: ts.Node | ts.Node[],
  ignoreLiterals = false,
): boolean {
  if (isNode(first) && isNode(second)) {
    return areEquivalentNodes(first, second, ignoreLiterals);
  } else if (isNodeArray(first) && isNodeArray(second)) {
    return (
      first.length === second.length &&
      first.every((leftNode, index) => areEquivalent(leftNode, second[index], ignoreLiterals))
    );
  } else {
    return false;
  }
}

function areEquivalentNodes(first: ts.Node, second: ts.Node, ignoreLiterals = false): boolean {
  if (first.kind !== second.kind) {
    return false;
  }

  const childCount = first.getChildCount();

  if (childCount !== second.getChildCount()) {
    return false;
  }

  if (childCount === 0 && COMPARED_BY_TEXT.has(first.kind)) {
    if (ignoreLiterals && is(first, ts.SyntaxKind.StringLiteral, ts.SyntaxKind.NumericLiteral)) {
      return true;
    }
    return first.getText() === second.getText();
  }

  return areEquivalent(first.getChildren(), second.getChildren(), ignoreLiterals);
}

function isNode(node: ts.Node | ts.Node[]): node is ts.Node {
  return (node as ts.Node).kind != null;
}

function isNodeArray(node: ts.Node | ts.Node[]): node is ts.Node[] {
  return (node as ts.Node).kind == null;
}
