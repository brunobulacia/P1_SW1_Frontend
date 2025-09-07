import DiagramCard from "./diagram-card";

const diagrams = [
  { name: "Diagram 1", description: "This is diagram 1" },
  { name: "Diagram 2", description: "This is diagram 2" },
  { name: "Diagram 3", description: "This is diagram 3" },
  { name: "Diagram 4", description: "This is diagram 4" },
  { name: "Diagram 5", description: "This is diagram 5" },
  { name: "Diagram 6", description: "This is diagram 6" },
  { name: "Diagram 7", description: "This is diagram 7" },
  { name: "Diagram 8", description: "This is diagram 8" },
  { name: "Diagram 9", description: "This is diagram 9" },
  { name: "Diagram 10", description: "This is diagram 10" },
  { name: "Diagram 11", description: "This is diagram 11" },
  { name: "Diagram 12", description: "This is diagram 12" },
  { name: "Diagram 13", description: "This is diagram 13" },
  { name: "Diagram 14", description: "This is diagram 14" },
  { name: "Diagram 15", description: "This is diagram 15" },
  { name: "Diagram 16", description: "This is diagram 16" },
  { name: "Diagram 17", description: "This is diagram 17" },
  { name: "Diagram 18", description: "This is diagram 18" },
];

function DiagramGridCards() {
  return (
    <div className="grid grid-cols-5 gap-4 p-8">
      {diagrams.map((diagram) => (
        <DiagramCard
          key={diagram.name}
          name={diagram.name}
          description={diagram.description}
        />
      ))}
    </div>
  );
}

export default DiagramGridCards;
