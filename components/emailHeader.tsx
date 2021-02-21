import { EmailJson } from "../types/ItemTypes";

const EmailHeader = ({ emailJson }: { emailJson: EmailJson }) => {
  const { to, from, subject } = emailJson;

  return (
    <div>
      <table>
        <thead></thead>
        <tbody>
          <tr>
            <td className="font-semibold pr-2">To</td>
            <td>{to}</td>
          </tr>
          <tr>
            <td className="font-semibold pr-2">From</td>
            <td>{from}</td>
          </tr>
          <tr>
            <td className="font-semibold pr-2">Subject</td>
            <td>{subject}</td>
          </tr>
        </tbody>
      </table>
      <style jsx>{`
        td {
          border: none;
        }
      `}</style>
    </div>
  );
};

export default EmailHeader;
