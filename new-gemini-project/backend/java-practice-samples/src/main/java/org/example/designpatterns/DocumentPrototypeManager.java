package org.example.designpatterns;

import java.util.HashMap;
import java.util.Map;

public class DocumentPrototypeManager {
    // A registry to hold our prototype documents
    private static Map<String, Document> prototypes = new HashMap<>();

    // Initialize prototypes
    static {
        prototypes.put("word", new WordDocument("word-template-001", "Master Word Template"));
        prototypes.put("pdf", new PdfDocument("pdf-template-001", "Master PDF Template"));
    }

    // Method to get a clone of a specific prototype
    public static Document getClonedDocument(String type, String newId, String newName) {
        Document prototype = prototypes.get(type);
        if (prototype == null) {
            throw new IllegalArgumentException("No prototype found for type: " + type);
        }
        Document clonedDoc = prototype.clone();
        // Customize the cloned document
        // Note: ID and Name are usually unique to a new document,
        // so you might want to implement setters for these in a real scenario
        // or pass them during clone if the design allows for it directly.
        // For simplicity, we are setting them directly here, assuming Document interface
        // has setters for these, or the specific concrete class allows it.
        // For this example, let's assume `id` and `name` are part of the initial clone's state
        // and we're just updating the content. In a real system, you might set new ID/Name on the clone.
        // For simplicity, this example directly assigns a new ID/Name to simulate new document.
        // A better approach would be to have setters or pass to a clone method in a real app.
        if (clonedDoc instanceof WordDocument) { // Ugly cast for example, ideally more generic setters.
            ((WordDocument) clonedDoc).id = newId;
            ((WordDocument) clonedDoc).name = newName;
        } else if (clonedDoc instanceof PdfDocument) {
            ((PdfDocument) clonedDoc).id = newId;
            ((PdfDocument) clonedDoc).name = newName;
        }

        return clonedDoc;
    }

    public static void main(String[] args) {
        System.out.println("--- Initializing Prototypes ---");
        // The static block above already initializes them.
        // You'll see the "Loading default content..." messages here.
        System.out.println("\n--- Creating Documents by Cloning ---");

        // Create a new Word Document by cloning the existing Word prototype
        Document doc1 = DocumentPrototypeManager.getClonedDocument("word", "doc-101", "Meeting Minutes");
        doc1.setContent("Detailed minutes for the Q3 planning meeting.");
        doc1.display();
        // Notice "Loading default content..." is NOT printed again for doc1

        Document doc2 = DocumentPrototypeManager.getClonedDocument("word", "doc-102", "Project Proposal");
        doc2.setContent("Proposal for the new software project.");
        doc2.display();
        // Again, no content loading message for doc2

        // Create a new PDF Document by cloning the existing PDF prototype
        Document doc3 = DocumentPrototypeManager.getClonedDocument("pdf", "report-001", "Annual Report");
        doc3.setContent("Comprehensive annual financial report.");
        doc3.display();

        // Create another PDF
        Document doc4 = DocumentPrototypeManager.getClonedDocument("pdf", "invoice-005", "Invoice for Client X");
        doc4.setContent("Invoice details for services rendered.");
        doc4.display();

        System.out.println("\n--- Original Prototypes remain unchanged ---");
        // You can verify that the original prototypes in the map are still intact
        // and haven't been modified by changes to their clones.
        prototypes.get("word").display();
        prototypes.get("pdf").display();
    }
}

class WordDocument implements Document {
    String id;
    String name;
    String content; // Could be large template loaded during initial creation

    public WordDocument(String id, String name) {
        this.id = id;
        this.name = name;
        // Simulate expensive content loading/initialization
        System.out.println("Loading default content for WordDocument '" + name + "'...");
        this.content = "This is a default Word document template.";
    }

    // Copy constructor for cloning (often used internally by clone() for deep copy)
    private WordDocument(WordDocument other) {
        this.id = other.id;
        this.name = other.name;
        this.content = other.content; // Shallow copy of immutable string, or deep copy if mutable
    }

    @Override
    public Document clone() {
        // Perform a shallow copy by default, or deep copy if objects are mutable
        try {
            // Using super.clone() provides a shallow copy of fields
            WordDocument clonedDoc = (WordDocument) super.clone();
            // If `content` were a mutable object (e.g., StringBuilder),
            // you'd do a deep copy here: clonedDoc.content = new StringBuilder(this.content.toString());
            return clonedDoc;
        } catch (CloneNotSupportedException e) {
            // This should not happen since we implement Cloneable
            throw new AssertionError("Cloning not supported for WordDocument", e);
        }
    }

    @Override
    public void setContent(String content) {
        this.content = content;
    }

    @Override
    public String getType() {
        return "Word Document";
    }

    @Override
    public void display() {
        System.out.println("--- " + getType() + " ---");
        System.out.println("ID: " + id + ", Name: " + name);
        System.out.println("Content: " + content);
        System.out.println("--------------------");
    }
}

class PdfDocument implements Document {
    String id;
    String name;
    String content; // Could be large template loaded during initial creation

    public PdfDocument(String id, String name) {
        this.id = id;
        this.name = name;
        // Simulate expensive content loading/initialization
        System.out.println("Loading default content for PdfDocument '" + name + "'...");
        this.content = "Default PDF template content.";
    }

    private PdfDocument(PdfDocument other) {
        this.id = other.id;
        this.name = other.name;
        this.content = other.content;
    }

    @Override
    public Document clone() {
        try {
            return (PdfDocument) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new AssertionError("Cloning not supported for PdfDocument", e);
        }
    }

    @Override
    public void setContent(String content) {
        this.content = content;
    }

    @Override
    public String getType() {
        return "PDF Document";
    }

    @Override
    public void display() {
        System.out.println("--- " + getType() + " ---");
        System.out.println("ID: " + id + ", Name: " + name);
        System.out.println("Content: " + content);
        System.out.println("--------------------");
    }
}

// Prototype Interface
interface Document extends Cloneable {
    Document clone(); // Declares the cloning method
    void display();   // Just for demonstrating the document
    void setContent(String content); // To modify the cloned document
    String getType();
}