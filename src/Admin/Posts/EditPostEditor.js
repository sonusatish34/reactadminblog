import React, { useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

function EditPostEditor({ existingContent, onContentChange }) {
  const editorRef = useRef();

  return (
    <div className="border rounded-md shadow-sm p-2">
      <CKEditor
        editor={ClassicEditor}
        data={existingContent}
        onReady={(editor) => {
          editorRef.current = editor;
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onContentChange(data);
        }}
        config={{
          toolbar: [
            "heading", "|",
            "bold", "italic", "underline", "strikethrough", "|",
            "link", "bulletedList", "numberedList", "|",
            "insertTable", "imageUpload", "blockQuote", "|",
            "undo", "redo"
          ],
          image: {
            toolbar: ["imageTextAlternative", "imageStyle:full", "imageStyle:side"]
          },
          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"]
          }
        }}
      />
    </div>
  );
}

export default EditPostEditor;
