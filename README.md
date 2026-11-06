# First Move

An independent product-engineering concept by Shrey Patel for the a16z speedrun talent team.

Choose a live role, attach a relevant work sample, and review an introduction before copying it.

## Run

```sh
python3 -m http.server 4317
```

Open http://localhost:4317. No dependencies or build step.

## What works

- Public Speedrun job lookup, with a clearly dated snapshot if the API fails.
- Title/company search and remote filtering over the loaded set.
- Editable ownership, decision, relevance, and open-question fields.
- Live introduction summary, URL validation, and copy-to-clipboard.
- Responsive layout and keyboard focus states.

## Deliberate limits

No accounts, application submission, private founder tools, claimed fit scores, or automatic introductions. Candidate text stays in tab memory and is never sent to a server or model. The copied draft is assembled from explicit inputs. Project claims remain candidate-supplied.

I used AI coding assistance for research, design, implementation, and checks. The interface uses the Hallmark Furrow theme in app scope.

## Product hypothesis

Specific work evidence may help candidates explain themselves and founders decide whether to talk. The prototype demonstrates the workflow; it does not prove that hypothesis. Test completed intro requests and mutually accepted conversations alongside relevance complaints and founder feedback. Validate where it belongs within the existing talent workflow first.

## Sources

- [Speedrun role](https://speedrun-talent-network.com/product-engineer/)
- [Public API documentation](https://speedrun-talent-network.com/developers)
- [API specification](https://speedrun-talent-network.com/api/v1/openapi.json)

Not an official Speedrun product.
