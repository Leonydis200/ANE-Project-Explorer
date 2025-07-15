"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = Card;
exports.CardContent = CardContent;
function Card({ children }) {
    return <div className="rounded-xl border bg-white dark:bg-gray-800 p-4 shadow-md">{children}</div>;
}
function CardContent({ children }) {
    return <div className="card-content">{children}</div>;
}
