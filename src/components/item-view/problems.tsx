  if (block.kind === 'attention') {
    return (
      <aside className="theory-attention" aria-label="Attention">
        <span className="theory-attention-icon" aria-hidden="true">
          ⚠
        </span>
        <div className="theory-attention-body">
          <TheoryFlow text={block.text ?? ''} className="theory-attention-text" />
        </div>
      </aside>
    )
  }
  if (block.kind === 'astuce') {
    return (
      <aside className="theory-astuce" aria-label="Astuce">
        <span className="theory-astuce-icon" aria-hidden="true">
          i
        </span>
        <div className="theory-astuce-body">
          <TheoryFlow text={block.text ?? ''} className="theory-astuce-text" />
        </div>
      </aside>
    )
  }
  if (block.kind === 'note') {
    if (/^attention\b/i.test(block.text ?? '')) {
      const text = (block.text ?? '').replace(/^attention\s*[!.]?\s*/i, '')
      return (
        <aside className="theory-attention" aria-label="Attention">
          <span className="theory-attention-icon" aria-hidden="true">
            ⚠
          </span>
          <div className="theory-attention-body">
            <TheoryFlow text={text} className="theory-attention-text" />
          </div>
        </aside>
      )
    }
    if (/^astuce\b/i.test(block.text ?? '')) {
      const text = (block.text ?? '').replace(/^astuce\s*[!.:]?\s*/i, '')
      return (
        <aside className="theory-astuce" aria-label="Astuce">
          <span className="theory-astuce-icon" aria-hidden="true">
            i
          </span>
          <div className="theory-astuce-body">
            <TheoryFlow text={text} className="theory-astuce-text" />
          </div>
        </aside>
      )
    }
    return (
      <div className="theory-text">
        <TheoryFlow text={block.text ?? ''} className="theory-paragraph" />
      </div>
    )
  }
