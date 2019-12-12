pragma solidity ^0.5.12;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract TicketToken is ERC721, Ownable {
    string public constant name = "Ticket Token";
    string public constant symbol = "TIKI";
    
    struct Event {
        string title;
        string description;
        uint amount;
        address token;
        uint existence;
        uint start;
        uint finish;
        string location;
        uint assistance;
        bool active;
    }
    
    enum Status {
        INITIAL,
        VALIDATED,
        FROOZEN,
        INVALID
    }
    
    struct Ticket {
        address owner;
        uint eventId;
        Status status;
    }
    
    Event[] public events;
    Ticket[] public tickets;
    
    mapping (uint => uint) coinbalance;
    mapping (uint => mapping (address => uint)) earned;
    
    event EventAdded(uint id,  address owner);
    event TicketIssued(uint id, uint eventId,  address buyer);
    event TransferedTicket(uint id, address sender, address beneficiary);
    
    
    function createEvent(
        string memory _title,
        string memory  _description,
        uint _amount,
        address _token,
        uint _existence,
        uint _start,
        uint _finish,
        string memory _location) public {

        // validate if event is in validate range date
        require(_start > block.timestamp, "The initial date is invalid");

        Event memory localEvent = Event({
            title:  _title,
            description: _description,
            amount: _amount,
            token: _token,
            existence: _existence,
            start: _start,
            finish: _finish,
            location: _location,
            assistance: 0,
            active: true
        });
        uint eventId = events.push(localEvent) - 1;
        
        emit EventAdded(eventId, msg.sender);
        
    }
    
    

    function mint(uint _event) public payable {
        Event storage current_event = events[_event];
        
        // validate event id exists
        require(current_event.active, "The event doesn't exists"); 
        
        require(msg.value == current_event.amount, 'The amoutn would be equal');
        
        
        require(current_event.assistance <= current_event.existence, 'This event is sold');
        // validate if event is in validate range date
        require(current_event.finish > block.timestamp, "The event has expired");
        
        
        // Validate user hasnt tiket for this event
        require(earned[_event][msg.sender] == 0, 'You already has a ticket fot this event');
        
        Ticket memory issue = Ticket({owner: msg.sender, eventId: _event, status: Status.INITIAL });
        uint ticketId = tickets.push(issue) - 1;
        coinbalance[_event] == msg.value;
        earned[_event][msg.sender] = ticketId;
        current_event.assistance = current_event.assistance + 1;
        emit TicketIssued(ticketId, _event, msg.sender);
        _mint(msg.sender, ticketId);
    }
}
