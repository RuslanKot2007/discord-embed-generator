function Field({field, onChange, onRemove}) {
  return (
    <div className="field">
      <input
        type="text"
        placeholder="Name"
        value={field.name}
        onChange={e => onChange('name', e.target.value)}
      />
      <input
        type="text"
        placeholder="Value"
        value={field.value}
        onChange={e => onChange('value', e.target.value)}
      />
      <button onClick={onRemove}>Remove</button>
    </div>
  );
}

function App() {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [color, setColor] = React.useState('#5865F2');
  const [fields, setFields] = React.useState([]);

  const updateField = (index, key, value) => {
    const updated = fields.map((f, i) =>
      i === index ? {...f, [key]: value} : f
    );
    setFields(updated);
  };

  const addField = () => setFields([...fields, {name: '', value: ''}]);
  const removeField = (idx) => setFields(fields.filter((_, i) => i !== idx));

  const embed = {
    title: title || undefined,
    description: description || undefined,
    color,
    fields: fields.filter(f => f.name || f.value)
  };
  const json = JSON.stringify({embeds: [embed]}, null, 2);

  return (
    <div className="container">
      <h1>Discord Embed Generator</h1>
      <div>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <label>
          Color <input type="color" value={color} onChange={e => setColor(e.target.value)} />
        </label>
        <h3>Fields</h3>
        {fields.map((f, i) => (
          <Field
            key={i}
            field={f}
            onChange={(k, v) => updateField(i, k, v)}
            onRemove={() => removeField(i)}
          />
        ))}
        <button onClick={addField}>Add Field</button>
      </div>
      <h2>Preview</h2>
      <div className="embed-preview" style={{'--color': color}}>
        {title && <h3>{title}</h3>}
        {description && <p>{description}</p>}
        {fields.map((f, i) => (
          <p key={i}><strong>{f.name}</strong>: {f.value}</p>
        ))}
      </div>
      <h2>JSON</h2>
      <pre>{json}</pre>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
