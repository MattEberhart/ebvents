# AI Form Autofill

## What it does
When a user types an event name (e.g. "Saturday Morning Basketball at Lincoln Park"), an LLM parses the string and pre-fills sport type, date/time, venue name, and description fields automatically.

## Why it's valuable
Reduces friction for event creation -- users can describe their event naturally and skip manual field entry. Differentiates the product with a modern AI-powered UX.

## Implementation notes
- Add a "Smart Fill" button next to the event name input that triggers the autofill
- Call a Server Action that sends the name string to OpenAI / Anthropic API with a structured output schema matching `EventFormValues`
- Return partial form values; merge into react-hook-form state via `setValue`
- Use zod to validate the LLM response before applying it
- Show a toast indicating which fields were auto-filled
- Env var: `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- Graceful fallback: if the API call fails, just leave fields as-is with an error toast
