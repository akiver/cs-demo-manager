using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Security;
using System.Text;

namespace Services.Concrete.Excel
{
    internal class WorkbookSheet
    {
        public string Name;
        public StreamWriter StreamWriter;
        public int RowCount;
    }

    public class Workbook: IDisposable
    {
        private readonly string _tempFolderPath;
        private readonly List<WorkbookSheet> _sheets;

        public Workbook()
        {
            _sheets = new List<WorkbookSheet>();
            _tempFolderPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            Directory.CreateDirectory(Path.Combine(_tempFolderPath, "_rels"));
            Directory.CreateDirectory(Path.Combine(_tempFolderPath, "xl", "_rels"));
            Directory.CreateDirectory(Path.Combine(_tempFolderPath, "xl", "worksheets"));
        }

        public void AddSheet(string sheetName)
        {
            if (_sheets.Any(sheet => sheet.Name == sheetName))
            {
                throw new Exception($"Sheet with name {sheetName} already exists");
            }

            var xmlFilePath = Path.Combine(_tempFolderPath, "xl", "worksheets", $"sheet{_sheets.Count + 1}.xml");
            var streamWriter = new StreamWriter(xmlFilePath, true);
            streamWriter.WriteLine(@"<?xml version=""1.0"" ?><worksheet mc:Ignorable=""x14ac"" xmlns =""http://schemas.openxmlformats.org/spreadsheetml/2006/main"" xmlns:mc=""http://schemas.openxmlformats.org/markup-compatibility/2006"" xmlns:r=""http://schemas.openxmlformats.org/officeDocument/2006/relationships"" xmlns:x14ac=""http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"" ><sheetData>");
            _sheets.Add(new WorkbookSheet
            {
                Name = sheetName,
                StreamWriter = streamWriter,
                RowCount = 1,
            });
        }

        public void AddRowToSheet(string sheetName, List<object> cells)
        {
            var sheet = _sheets.FirstOrDefault((s) => s.Name == sheetName);
            if (sheet == null)
            {
                throw new Exception($"Sheet with name {sheetName} doesn't exists, did you forget to call addSheet()?");
            }

            var xml = $@"<row r=""{sheet.RowCount}"">";
            for (var cellIndex = 0; cellIndex < cells.Count; cellIndex++)
            {
                var cell = cells[cellIndex];
                var type = IsNumber(cell) ? "n" : "inlineStr";
                var letter = GetColumnLetterFromColumnNumber(cellIndex);
                xml += $@"<c r=""{letter}{sheet.RowCount}"" t=""{type}"">";
                if (type == "inlineStr")
                {
                    var value = cell is bool ? cell : SecurityElement.Escape(cell as string);
                    xml += $@"<is><t>{value}</t></is>";
                }
                else
                {
                    xml += $@"<v>{cell}</v>";
                }
                xml += "</c>";
            }

            xml += "</row>";

            sheet.StreamWriter.Write(xml);
            sheet.RowCount++;
        }

        public void Write(string destinationPath)
        {
            foreach(var sheet in _sheets)
            {
                sheet.StreamWriter.Write("</sheetData></worksheet>");
                sheet.StreamWriter.Close();
            }

            WriteRootXML();
            WriteWorkbookRelationsXml();
            WriteRootRelationsXml();
            WriteWorkbookXML();
            if (File.Exists(destinationPath))
            {
                File.Delete(destinationPath);
            }
            System.IO.Compression.ZipFile.CreateFromDirectory(_tempFolderPath, destinationPath);
        }

        // [Content_Types].xml
        private void WriteRootXML()
        {
            var xml = @"<?xml version=""1.0"" encoding=""UTF-8""?><Types xmlns=""http://schemas.openxmlformats.org/package/2006/content-types""><Default ContentType=""application/xml"" Extension=""xml""/><Default ContentType=""application/vnd.openxmlformats-package.relationships+xml"" Extension=""rels"" /><Override ContentType=""application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"" PartName=""/xl/workbook.xml"" />";
            for (var i = 1; i <= _sheets.Count; i++)
            {
                xml += $@"<Override ContentType=""application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"" PartName=""/xl/worksheets/sheet{i}.xml"" />";
            }
            xml += "</Types>";

            File.WriteAllText(Path.Combine(_tempFolderPath, "[Content_Types].xml"), xml);
        }

        // xl/_rels/workbook.xml.rels
        private void WriteWorkbookRelationsXml()
        {
            var xml = @"<?xml version=""1.0"" encoding=""UTF-8""?><Relationships xmlns=""http://schemas.openxmlformats.org/package/2006/relationships"">";
            for (var i = 1; i <= _sheets.Count; i++)
            {
                xml += $@"<Relationship Id=""rId{i}"" Target=""worksheets/sheet{i}.xml"" Type=""http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"" />";
            }
            xml += "</Relationships>";

            File.WriteAllText(Path.Combine(_tempFolderPath, "xl", "_rels", "workbook.xml.rels"), xml);
        }

        // ./_rels/.rels
        private void WriteRootRelationsXml()
        {
            var xml = @"<?xml version=""1.0"" encoding=""UTF-8""?><Relationships xmlns=""http://schemas.openxmlformats.org/package/2006/relationships""><Relationship Id=""rId1"" Target=""xl/workbook.xml"" Type=""http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument""/></Relationships>";

            File.WriteAllText(Path.Combine(_tempFolderPath, "_rels", ".rels"), xml);
        }

        // ./xl/workbook.xml
        private void WriteWorkbookXML()
        {
            var xml = @"<?xml version=""1.0"" encoding=""UTF-8""?><workbook mc:Ignorable=""x15"" xmlns=""http://schemas.openxmlformats.org/spreadsheetml/2006/main"" xmlns:mc=""http://schemas.openxmlformats.org/markup-compatibility/2006"" xmlns:r=""http://schemas.openxmlformats.org/officeDocument/2006/relationships"" xmlns:x15=""http://schemas.microsoft.com/office/spreadsheetml/2010/11/main""><sheets>";
            for (var i = 0; i < _sheets.Count; i++)
            {
                xml += $@"<sheet name=""{_sheets[i].Name}"" r:id=""rId{i + 1}"" sheetId=""{i + 1}""/>";
            }
            xml += "</sheets></workbook>";

            File.WriteAllText(Path.Combine(_tempFolderPath, "xl", "workbook.xml"), xml);
        }

        /**
        * Returns the column letter used by Excel from its number (A1, B10, D4...).
        * See https://docs.microsoft.com/en-us/office/troubleshoot/excel/convert-excel-column-numbers
        */
        private static string GetColumnLetterFromColumnNumber(int columnNumber)
        {
            // Excel counts column A as the 1st column, we
            //  treat it as the 0th one
            int excelColNum = columnNumber + 1;

            StringBuilder colRef = new StringBuilder(2);
            int colRemain = excelColNum;

            while (colRemain > 0)
            {
                int thisPart = colRemain % 26;
                if (thisPart == 0) { thisPart = 26; }
                colRemain = (colRemain - thisPart) / 26;

                // The letter A is at 65
                char colChar = (char)(thisPart + 64);
                colRef.Insert(0, colChar);
            }

            return colRef.ToString();
        }

        private static bool IsNumber(object value)
        {
            return value is sbyte
                    || value is byte
                    || value is short
                    || value is ushort
                    || value is int
                    || value is uint
                    || value is long
                    || value is ulong
                    || value is float
                    || value is double
                    || value is decimal;
        }

        public void Dispose()
        {
            foreach (var sheet in _sheets)
            {
                sheet.StreamWriter.Close();
            }
            _sheets.Clear();
            if (File.Exists(_tempFolderPath))
            {
                File.Delete(_tempFolderPath);
            }
        }
    }
}
