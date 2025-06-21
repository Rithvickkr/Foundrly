"use client";

import { useEffect , useState } from "react";
import { getDecks } from "@/lib/actions/getdecks";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  ChevronRight,
  PlusCircle,
  Clock,
  Star,
  History,
  Rocket,
  MessageSquare,
  Video,
  Headphones,
  FileText,
  User,
  CreditCard,
  Shield,
  Presentation
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getUser } from "@/lib/actions/getuser";

const data = {
 
  navMain: [
    {
      title: "New Pitch Deck",
      url: "/appdash",
      icon: SquareTerminal,
    },
    {
      title: "Decks",
      url: "/decks",
      icon: Presentation,
    },
    {
      title: "CoFounder",
      url: "/cofounder",
      icon:Bot,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
          icon: User,
        },
        {
          title: "Team",
          url: "#",
          icon: User,
        },
        {
          title: "Billing",
          url: "#",
          icon: CreditCard,
        },
        {
          title: "Limits",
          url: "#",
          icon: Shield,
        },
      ],
    },
  ],
  History: [] as { title: string; url: string; icon: any }[],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeSection, setActiveSection] = useState<string | null>("New Pitch Deck");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const[user, setUser] = useState({
    name: "",
    email: "",
    avatar: "",
  });
  
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      if (user) {
        
        setUser({
          ...user,
          avatar:  "/avatars/shadcn.jpg" // Add default avatar if not provided
        });
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchDecks = async () => {
      const decks = await getDecks();
      // Sort decks by date and take only the latest three
      const sortedDecks = decks ? 
        [...decks].sort((a, b) => 
          new Date( b.created_at).getTime() - 
          new Date( a.created_at).getTime()
        ).slice(0, 3) : [];
      if (decks) {
        data.History = sortedDecks.map(deck => ({
          title: deck.title,
          url: `/pitchdeck/${deck.id}`,
          icon: Presentation,
        }));
      }
    };
    fetchDecks();
  }
  , []);
  

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  const isExpanded = (title: string) => expandedSections.includes(title);

  return (
    <Sidebar 
      className=" min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-800 shadow-sm"
      variant="sidebar" 
      {...props}
    >
      <SidebarHeader className="border-b   bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-800 py-4 ">
        <SidebarMenu className="flex items-center ">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/appdash" className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white flex aspect-square size-10 items-center justify-center rounded-lg shadow-md">
                  <Command className="size-5" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                    FounderGPT
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    AI-Powered Startup Advisor
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-4 px-2 border-b  border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100  shadow-sm">
        {/* Custom Nav Implementation */}
        <div className="space-y-6">
          <div className="px-3">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Main
            </h3>
            <ul className="mt-2 space-y-1">
              {data.navMain.map((item, index) => (
                <li key={index}>
                  {!item.items ? (
                    <a
                      href={item.url}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                        activeSection === item.title
                          ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                      }`}
                      onClick={() => setActiveSection(item.title)}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`size-5 ${
                          activeSection === item.title
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`} />
                        <span>{item.title}</span>
                      </div>
                      {item.items && (
                        <ChevronRight className={`size-4 transition-transform ${
                          isExpanded(item) ? "rotate-90" : ""
                        }`} />
                      )}
                    </a>
                    
                  ) : (
                    <div>
                      <button
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                          activeSection === item.title
                            ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                        }`}
                        onClick={() => {
                          toggleSection(item.title);
                          setActiveSection(item.title);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`size-5 ${
                            activeSection === item.title
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`} />
                          <span>{item.title}</span>
                        </div>
                        <ChevronRight className={`size-4 transition-transform ${
                          isExpanded(item.title) ? "rotate-90" : ""
                        }`} />
                      </button>
                      
                      {isExpanded(item.title) && (
                        <ul className="mt-1 ml-2 pl-6 space-y-1 border-l border-gray-200 dark:border-gray-800">
                          {item.items.map((subItem, subIndex) => (
                            <li key={subIndex}>
                              <a
                                href={subItem.url}
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              >
                                {subItem.icon && <subItem.icon className="size-4 text-gray-500 dark:text-gray-400" />}
                                <span>{subItem.title}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="px-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recent Projects
              </h3>
              <button className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                <PlusCircle className="size-4" />
              </button>
            </div>
            
            <div className="mt-4 space-y-1">
              {data.History.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                  <Clock className="size-8 mb-2 text-gray-400 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No recent projects</p>
                  <button className="mt-3 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 transition-colors">
                    <PlusCircle className="size-3.5" />
                    Create New Project
                  </button>
                </div>
              ) : (
                <ul className="space-y-1">
                  {data.History.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.url}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <item.icon className="size-4 text-gray-500 dark:text-gray-400" />
                        <span className="truncate">{item.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* <div className="px-3 pt-4 mt-auto border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Support
            </h3>
            <ul className="mt-2 space-y-1">
              {data.navSecondary.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.url}
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <item.icon className="size-5 text-gray-500 dark:text-gray-400" />
                    <span>{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div> */}
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-950 border-gray-200 dark:border-gray-800 p-4">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}