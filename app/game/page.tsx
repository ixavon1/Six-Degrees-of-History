"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Card {
  id: string;
  name: string;
}

interface CardProps {
  id: string;
  name: string;
  index?: number;
  totalCards?: number;
  isInHand?: boolean;
}

function DraggableCard({ id, name }: { id: string; name: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`w-32 h-48 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center cursor-grab hover:from-slate-500 hover:to-slate-700 active:cursor-grabbing select-none border-2 border-slate-500 shadow-lg ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <span className="font-semibold text-lg">{name}</span>
    </div>
  );
}

function HandCard({ id, name, index = 0, totalCards = 1 }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Calculate hand fan effect
  const middleIndex = (totalCards - 1) / 2;
  const offset = index - middleIndex;
  const rotation = offset * 8; // degrees of rotation per card
  const translateY = Math.abs(offset) * 10; // vertical offset for arc effect

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    "--rotation": `${rotation}deg`,
    "--translateY": `${translateY}px`,
    marginLeft: index === 0 ? "0" : "-24px",
    zIndex: index,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-32 h-48 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center cursor-grab hover:from-slate-500 hover:to-slate-700 active:cursor-grabbing select-none border-2 border-slate-500 shadow-lg transform hover:-translate-y-4 hover:z-50 transition-transform"
    >
      <span className="font-semibold text-lg">{name}</span>
    </div>
  );
}

function CardOverlay({ name }: { name: string }) {
  return (
    <div className="w-32 h-48 bg-gradient-to-br from-slate-500 to-slate-700 rounded-lg flex items-center justify-center cursor-grabbing select-none border-2 border-slate-400 shadow-2xl transform scale-105">
      <span className="font-semibold text-lg">{name}</span>
    </div>
  );
}

function CenterDropZone({ card }: { card: Card | null }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "center-zone",
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-36 h-52 rounded-xl border-4 border-dashed flex items-center justify-center transition-all duration-200 ${
        isOver
          ? "border-emerald-400 bg-emerald-900/30 scale-105"
          : card
          ? "border-slate-500 bg-slate-700/50"
          : "border-slate-600 bg-slate-800/50"
      }`}
    >
      {card ? (
        <DraggableCard id={card.id} name={card.name} />
      ) : (
        <span className="text-slate-500 text-sm text-center px-2">
          Drop a card here
        </span>
      )}
    </div>
  );
}

export default function GamePage() {
  const [handCards, setHandCards] = useState<Card[]>([
    { id: "card-a", name: "Card A" },
    { id: "card-b", name: "Card B" },
    { id: "card-c", name: "Card C" },
  ]);
  const [centerCard, setCenterCard] = useState<Card | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const cardInHand = handCards.find((c) => c.id === active.id);
    const cardInCenter = centerCard?.id === active.id ? centerCard : null;
    setActiveCard(cardInHand || cardInCenter || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dragging from hand
    const isFromHand = handCards.some((c) => c.id === activeId);
    // Check if dragging from center
    const isFromCenter = centerCard?.id === activeId;

    // Dropping on center zone
    if (overId === "center-zone") {
      if (isFromHand) {
        // Move card from hand to center (swapping if center is not empty)
        const card = handCards.find((c) => c.id === activeId);
        if (card) {
          setHandCards((cards) => {
            if (centerCard) {
              return cards.map((c) => (c.id === activeId ? centerCard : c));
            }
            return cards.filter((c) => c.id !== activeId);
          });
          setCenterCard(card);
        }
      }
      return;
    }

    // Dropping on hand area or another card in hand
    if (isFromCenter) {
      // Move card from center back to hand
      if (centerCard) {
        const overIndex = handCards.findIndex((c) => c.id === overId);
        if (overId === "hand-zone" || overIndex === -1) {
          // Drop at end of hand
          setHandCards((cards) => [...cards, centerCard]);
        } else {
          // Drop at specific position
          setHandCards((cards) => {
            const newCards = [...cards];
            newCards.splice(overIndex, 0, centerCard);
            return newCards;
          });
        }
        setCenterCard(null);
      }
      return;
    }

    // Reordering within hand
    if (isFromHand && overId !== "center-zone") {
      const oldIndex = handCards.findIndex((c) => c.id === activeId);
      const newIndex = handCards.findIndex((c) => c.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setHandCards((cards) => arrayMove(cards, oldIndex, newIndex));
      }
    }
  }

  return (
    <main className="min-h-screen bg-slate-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4">
        <h2 className="text-2xl font-bold">Six Degrees of History</h2>
        <p className="text-slate-400 text-sm mt-1">
          Drag cards to the center or reorder your hand
        </p>
      </div>

      {/* Game Area */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Center Play Area */}
        <div className="flex-1 flex items-center justify-center">
          <CenterDropZone card={centerCard} />
        </div>

        {/* Hand Area at Bottom */}
        <div className="pb-8 pt-4">
          <SortableContext
            items={handCards.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex justify-center items-end px-8">
              {handCards.map((card, index) => (
                <HandCard
                  key={card.id}
                  id={card.id}
                  name={card.name}
                  index={index}
                  totalCards={handCards.length}
                  isInHand={true}
                />
              ))}
              {handCards.length === 0 && (
                <div className="text-slate-500 text-sm py-8">
                  Your hand is empty
                </div>
              )}
            </div>
          </SortableContext>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard ? <CardOverlay name={activeCard.name} /> : null}
        </DragOverlay>
      </DndContext>
    </main>
  );
}
