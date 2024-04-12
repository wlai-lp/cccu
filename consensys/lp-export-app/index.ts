require("dotenv").config();
const dbHost = process.env.DB_HOST;
const LP_USER = process.env.LP_USER;
const LP_PASSWORD = process.env.LP_PASSWORD;
const SEARCH_LIMIT = process.env.SEARCH_LIMIT;
const FROM_DATE: string = process.env.FROM_DATE!;
const TO_DATE: string = process.env.TO_DATE!;

console.log(`Database host: ${dbHost}`);

const OUTPUT = process.env.OUTPUT_DIR;
const LP_SITE_ID = process.env.LP_SITE_ID;
const DOMAIN_URL = `https://api.liveperson.net/api/account/${LP_SITE_ID}/service/baseURI?version=1.0`;

import cron from "node-cron";
import * as fs from "fs";
import path from "path";

import type {
  LPDomains,
  LPAuth,
  HistorySearchResult,
  FileLinkPayload,
} from "./types";

console.log("Hello via Bun!");

async function startLPExtract(from: number, to: number) {
  const lpDomains: LPDomains = await fetchDomainURLs();
  const msgHist = lpDomains.baseURIs.find(
    (entry) => entry.service == "msgHist"
  ).baseURI;
  console.log("🚀 ~ startLPExtract ~ msgHist:", msgHist);

  const authToken = await getAuthToken();
  console.log("🚀 ~ startLPExtract ~ authToken:", authToken);

  const historySearchResult = await extractMessagingHistory(
    from,
    to,
    msgHist,
    authToken!
  );

  const searchCount = historySearchResult?._metadata.count;
  console.log("🚀 ~ startLPExtract ~ searchCount:", searchCount);
  const pages = searchCount / SEARCH_LIMIT;
  console.log("🚀 ~ startLPExtract ~ count / limit = pages:", pages);

  // NOTE: this is just a POC, you need to use _meta has next to do the next run
  //historySearchResult?._metadata.next.href
  for (let i = 1; i <= pages; i++) {
    // TODO: need a loop to loop the results
    const writeFileResult = await writeToFile(historySearchResult!, i);
  }
  // TODO: historySearchResult has _metadata reference to the next URL call with the corresponding offset

  // download file
  // NOTE: i recommend download all the msg json first, then have another process to parse the json file for attachment
  // and do the download separately
  // ? parse history for all image links, return as string array
  // ? functions to take list of download urls and invoke get image
  //   const fileLinkPayload: FileLinkPayload[] = getListOfFilePayload(historySearchResult!);
  //   console.log("🚀 ~ startLPExtract ~ fileLinkPayload:", JSON.stringify(fileLinkPayload))

  const downloadResult = getAttachments(
    msgHist,
    authToken!,
    historySearchResult!
  );
}

function getListOfFilePayload(historySearchResult: HistorySearchResult) {
  const fileLinkPayloadList: FileLinkPayload[] = [];
  historySearchResult.conversationHistoryRecords.map((convo) => {
    const latestAgentId = convo.info.latestAgentId;
    const conversationId = convo.info.conversationId;
    const listOfFiles = convo.messageRecords.filter(
      (record) => record.type == "HOSTED_FILE"
    );
    // console.log("🚀 ~ historySearchResult.conversationHistoryRecords.map ~ listOfFiles:", JSON.stringify(listOfFiles))
    listOfFiles.forEach((item) => {
      let fileLinkPayload: FileLinkPayload = {
        conversationId: "",
        fileId: "",
        latestAgentId: "",
      };
      fileLinkPayload.latestAgentId = latestAgentId;
      fileLinkPayload.conversationId = conversationId;
      const pathParts = item.messageData.file?.relativePath.split("/");
      fileLinkPayload.fileId = pathParts![pathParts!.length - 1];
      fileLinkPayloadList.push(fileLinkPayload);
    });
  });
  return fileLinkPayloadList;
}

async function getAttachments(
  msgHist: string,
  authToken: string,
  historySearchResult: HistorySearchResult
) {
  try {
    const fileLinkPayloads: FileLinkPayload[] =
      getListOfFilePayload(historySearchResult);
    console.log(
      "🚀 ~ getAttachmentURLs ~ fileLinkPayload:",
      JSON.stringify(fileLinkPayloads)
    );
    for (let fileLinkPayload of fileLinkPayloads) {
      const url: string = await getAttachmentURL(
        msgHist,
        authToken,
        fileLinkPayload
      );
      console.log("🚀 ~ getAttachments ~ url:", url);
    //   const downloadFileResult = downloadFile(url, fileLinkPayload.fileId);
      await bunDownloadFile(url, fileLinkPayload.fileId);
      console.log("done");
      
    }
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

async function bunDownloadFile(url: string, fileName: string){
    const result = await fetch(url);
    const fullPath = path.join(OUTPUT, fileName);
    await Bun.write(fullPath, result);  
}

/**
 *
 * @param url
*/
async function downloadFile(url: string, fileName: string) {
  const imageUrl = url;
  // const filePath = OUTPUT + fileName;
  const fullPath = path.join(OUTPUT, fileName);
  console.log("🚀 ~ downloadFile ~ fullPath:", fullPath);

  console.log("🚀 ~ downloadFile ~ imageUrl:", imageUrl)
  fetch(imageUrl)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch image");
      }
      return res.buffer(); // Convert response body to buffer
    })
    .then((buffer) => {
      fs.writeFileSync(fullPath, buffer); // Write buffer to file
      console.log("Image saved successfully");
      return true;
    })
    .catch((err) => {
      console.error("Error:", err.message);
      return false;
    });
}
  

async function getAttachmentURL(
  msgHist: string,
  authToken: string,
  fileLinkPayload: FileLinkPayload
) {
  try {
    const myHeaders = new Headers();
    myHeaders.append("authorization", `Bearer ${authToken}`);
    myHeaders.append("cache-control", "no-cache");
    myHeaders.append("content-type", "application/json");

    const raw = JSON.stringify(fileLinkPayload);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    // fetch(
    //   "https://va.msghist.liveperson.net/messaging_history/api/account/90412079/conversations/file-sharing?source=ccuiNAWFileDownload&NC=true&__d=47236",
    //   requestOptions
    // );
    const url = `https://${msgHist}/messaging_history/api/account/${LP_SITE_ID}/conversations//file-sharing`;
    console.log("🚀 ~ generate download link url:", url);
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const downloadLinkURL = await response.text();
    console.log("🚀 ~ getAttachmentURLs ~ downloadLinkURL:", downloadLinkURL);
    return downloadLinkURL;
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

async function writeToFile(
  historySearchResult: HistorySearchResult,
  i: number
) {
  const outputJsonFolder = OUTPUT + "/json/";

  await fs.access(outputJsonFolder, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("Folder does not exist");
    } else {
      console.log("Folder exists");
    }
  });

  const data = JSON.stringify(historySearchResult);
  await Bun.write(outputJsonFolder + i + "output.json", data);
  // TODO: catch errors if failed to write
  return true;
}

async function extractMessagingHistory(
  from: number,
  to: number,
  msgHist: string,
  authToken: string
) {
  try {
    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("authorization", `Bearer ${authToken}`);
    myHeaders.append("cache-control", "no-cache");
    myHeaders.append("content-type", "application/json");

    const raw = JSON.stringify({
      status: ["OPEN", "CLOSE"],
      start: {
        from: from,
        to: to,
      },
      contentToRetrieve: [
        "messageRecords",
        "agentParticipants",
        "consumerParticipants",
        "sdes",
        "responseTime",
        "transfers",
        "dialogs",
        "summary",
        "conversationSurveys",
        "unAuthSdes",
      ],
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    // fetch("https://va.msghist.liveperson.net/messaging_history/api/account/90412079/conversations/search", requestOptions)
    const url = `https://${msgHist}/messaging_history/api/account/${LP_SITE_ID}/conversations/search?limit=${SEARCH_LIMIT}`;
    // https://va.msghist.liveperson.net/messaging_history/api/account/90412079/conversations/search
    console.log("🚀 ~ url:", url);
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data: HistorySearchResult = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

async function getAuthToken() {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");

    const raw = JSON.stringify({
      username: LP_USER,
      password: LP_PASSWORD,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const url = `https://va.agentvep.liveperson.net/api/account/${LP_SITE_ID}/login?v=1.3`;
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data: LPAuth = await response.json();
    return data.bearer;
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

async function fetchDomainURLs() {
  try {
    const response = await fetch(DOMAIN_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    // console.log(data); // This will log the JSON data retrieved from the API
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

// Define your task
const scheduledTask = async () => {
  console.log("This is a scheduled task running every 30 seconds.");
  // Place your job logic here
};

// Schedule the task to run every 30 seconds
cron.schedule("*/30 * * * * *", scheduledTask);

console.log("Scheduled job has been set.");

const from = new Date(FROM_DATE).getTime();
const to = new Date(TO_DATE).getTime();
// startLPExtract(1712808000000, 1712877921039);
startLPExtract(from, to);
