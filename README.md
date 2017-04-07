# Gossip Mill

Backend application for aggregating and supplying messages from multiple sources given some criteria.

## Config

Aggregation criteria must be provided as initial configuration:

```json
{
    "tokens":
    [
        {
            "name":"course",
            "regex":"https:\/\/(.*)\.connectedacademy\.io\/.*"            
        },
        {
            "name":"class",
            "regex":"https:\/\/.*\.connectedacademy\.io\/#\/(.*)\/.*"            
        },
        {
            "name":"segment",
            "regex":"https:\/\/.*\.connectedacademy\.io\/#\/.*\/(.*)"            
        },
        {
            "name":"like",
            "regex":"https:\/\/.*\.connectedacademy\.io\/content\/(.*)"            
        },
        {
            "name":"hub",
            "regex":"#ca-(.*)"
        }
    ]
}
```